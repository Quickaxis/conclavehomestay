-- ==========================================================
-- 02_BOOKING_REQUESTS_MIGRATION.SQL
-- ==========================================================
-- Safely stores incoming website booking requests in the HMS database
-- without falsely confirming them or blocking physical room inventory.
--
-- DO NOT EXECUTE AGAINST PRODUCTION WITHOUT USER APPROVAL.
-- ==========================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homestay_id UUID NOT NULL REFERENCES homestays(id) ON DELETE RESTRICT,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    number_of_guests INTEGER NOT NULL DEFAULT 1 CHECK (number_of_guests > 0),
    guest_name TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    guest_email TEXT,
    notes TEXT,
    estimated_total INTEGER DEFAULT 0 CHECK (estimated_total >= 0),
    payment_method TEXT NOT NULL DEFAULT 'pay_at_property',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_out_after_check_in CHECK (check_out > check_in)
);

-- Idempotent column additions in case table was previously created
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;
ALTER TABLE booking_requests ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'pay_at_property';

-- 3. Performance & filtering indexes
CREATE INDEX IF NOT EXISTS idx_booking_requests_homestay_id ON booking_requests(homestay_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON booking_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_requests_homestay_status ON booking_requests(homestay_id, status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_booking_id ON booking_requests(booking_id);

-- 4. Row Level Security (RLS)
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'booking_requests' AND policyname = 'Allow active partners to read booking requests'
    ) THEN
        CREATE POLICY "Allow active partners to read booking requests"
        ON booking_requests FOR SELECT
        TO authenticated
        USING (
            is_super_admin() OR 
            (homestay_id = get_user_homestay_id() AND is_active_partner())
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'booking_requests' AND policyname = 'Allow active partners to update booking requests'
    ) THEN
        CREATE POLICY "Allow active partners to update booking requests"
        ON booking_requests FOR UPDATE
        TO authenticated
        USING (
            is_super_admin() OR 
            (homestay_id = get_user_homestay_id() AND is_active_partner())
        )
        WITH CHECK (
            is_super_admin() OR 
            (homestay_id = get_user_homestay_id() AND is_active_partner())
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'booking_requests' AND policyname = 'Allow service role full access to booking requests'
    ) THEN
        CREATE POLICY "Allow service role full access to booking requests"
        ON booking_requests FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END $$;

-- 5. Safe permissions: Authenticated hosts can select & update; backend service_role has full access; anon/public revoked
GRANT SELECT, UPDATE ON TABLE booking_requests TO authenticated;
GRANT ALL ON TABLE booking_requests TO service_role;
REVOKE ALL ON TABLE booking_requests FROM public, anon;

-- 6. Add to realtime replication so dashboard updates automatically
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) AND NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'booking_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE booking_requests;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

NOTIFY pgrst, 'reload schema';
