-- ==========================================================
-- 01_PUBLIC_BOOKING_RPC.SQL
-- Narrowly scoped atomic booking function for trusted website servers.
-- ==========================================================
-- This function allows the website's trusted Node.js backend (using the service_role key)
-- to create a pay-at-property reservation atomically with row locking (FOR UPDATE)
-- without storing partner passwords or requiring a personal Supabase Auth session.
--
-- Security features:
-- 1. Strictly revoked from anon and public; granted ONLY to service_role.
-- 2. Scoped to p_homestay_id to enforce tenant isolation.
-- 3. Row lock: SELECT FOR UPDATE on rooms prevents concurrent double-booking races.
-- 4. Rates and totals calculated exclusively from trusted rooms table.
-- 5. Atomically inserts into bookings and guests in a single transaction.
-- 6. Enforces storage-engine level double-booking exclusion via btree_gist.
-- ==========================================================

-- 1. Ensure required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- PRE-FLIGHT CHECK (Run manually before applying if database already has historical data):
-- SELECT b1.id, b2.id, b1.room_id, b1.check_in, b1.check_out
-- FROM bookings b1 JOIN bookings b2 ON b1.room_id = b2.room_id AND b1.id != b2.id
-- WHERE b1.status != 'cancelled' AND b2.status != 'cancelled'
--   AND daterange(b1.check_in, b1.check_out, '[)') && daterange(b2.check_in, b2.check_out, '[)');

-- 2. Ensure double-booking exclusion constraint is active on bookings table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'prevent_overlapping_active_bookings'
    ) THEN
        ALTER TABLE bookings
        ADD CONSTRAINT prevent_overlapping_active_bookings
        EXCLUDE USING gist (
            room_id WITH =,
            daterange(check_in, check_out, '[)') WITH &&
        )
        WHERE (status != 'cancelled');
    END IF;
END $$;

-- 3. Dedicated atomic booking function for website service-role caller
CREATE OR REPLACE FUNCTION create_public_booking_atomic(
    p_homestay_id UUID,
    p_room_id UUID,
    p_check_in DATE,
    p_check_out DATE,
    p_number_of_guests INTEGER,
    p_guest_name TEXT,
    p_guest_phone TEXT,
    p_guest_email TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_homestay homestays%ROWTYPE;
    v_room rooms%ROWTYPE;
    v_partner_id UUID;
    v_nights INTEGER;
    v_total INTEGER;
    v_booking_id UUID;
BEGIN
    -- 1. Date validation
    IF p_check_in < CURRENT_DATE THEN
        RAISE EXCEPTION 'CHECK_IN_PAST: Check-in date cannot be in the past';
    END IF;

    IF p_check_out <= p_check_in THEN
        RAISE EXCEPTION 'CHECK_OUT_INVALID: Check-out date must be strictly after check-in date';
    END IF;

    -- 2. Guest count validation
    IF p_number_of_guests <= 0 THEN
        RAISE EXCEPTION 'INVALID_GUEST_COUNT: Number of guests must be at least 1';
    END IF;

    -- 3. Guest details validation
    IF p_guest_name IS NULL OR length(trim(p_guest_name)) = 0 THEN
        RAISE EXCEPTION 'GUEST_NAME_REQUIRED: Guest name is required';
    END IF;

    IF p_guest_phone IS NULL OR length(trim(p_guest_phone)) < 8 THEN
        RAISE EXCEPTION 'GUEST_PHONE_REQUIRED: Valid guest phone number is required (min 8 digits)';
    END IF;

    -- 4. Verify homestay exists and is active
    SELECT * INTO v_homestay
    FROM homestays
    WHERE id = p_homestay_id AND is_active = true;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'HOMESTAY_NOT_FOUND: Active homestay does not exist';
    END IF;

    -- 5. Atomic Room Lock with tenant scoping (Critical Concurrency Protection)
    SELECT * INTO v_room
    FROM rooms
    WHERE id = p_room_id 
      AND homestay_id = p_homestay_id 
      AND is_active = true
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ROOM_NOT_FOUND: Room does not exist or does not belong to this homestay';
    END IF;

    -- 6. Capacity check
    IF p_number_of_guests > v_room.max_guests THEN
        RAISE EXCEPTION 'CAPACITY_EXCEEDED: Number of guests (%) exceeds room capacity (%)',
            p_number_of_guests, v_room.max_guests;
    END IF;

    -- 7. Overlapping booking check (Exclusion protection)
    IF EXISTS (
        SELECT 1 FROM bookings
        WHERE room_id = p_room_id
          AND status != 'cancelled'
          AND check_in < p_check_out
          AND check_out > p_check_in
    ) THEN
        RAISE EXCEPTION 'ROOM_UNAVAILABLE: Room is already booked for the selected dates';
    END IF;

    -- 8. Rate & total calculation strictly from trusted database room record
    v_nights := (p_check_out - p_check_in);
    IF v_nights <= 0 THEN v_nights := 1; END IF;
    v_total := v_nights * v_room.nightly_rate;

    -- 9. Resolve homestay partner for attribution
    SELECT id INTO v_partner_id
    FROM partners
    WHERE homestay_id = p_homestay_id AND is_active = true
    ORDER BY created_at ASC
    LIMIT 1;

    -- If no dedicated partner is assigned, link to super_admin partner
    IF v_partner_id IS NULL THEN
        SELECT id INTO v_partner_id
        FROM partners
        WHERE role = 'super_admin' AND is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    -- If no super_admin partner is assigned, link to any active partner
    IF v_partner_id IS NULL THEN
        SELECT id INTO v_partner_id
        FROM partners
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    IF v_partner_id IS NULL THEN
        RAISE EXCEPTION 'PARTNER_NOT_FOUND: No active partner or super_admin found for booking attribution';
    END IF;

    -- 10. Insert confirmed booking record (Pay-at-property)
    INSERT INTO bookings (
        room_id,
        partner_id,
        homestay_id,
        check_in,
        check_out,
        status,
        number_of_guests,
        nightly_rate,
        total_amount,
        notes
    ) VALUES (
        p_room_id,
        v_partner_id,
        p_homestay_id,
        p_check_in,
        p_check_out,
        'confirmed',
        p_number_of_guests,
        v_room.nightly_rate,
        v_total,
        CASE 
            WHEN p_notes IS NOT NULL AND length(trim(p_notes)) > 0 THEN '[Direct Website Pay-at-Property Booking] ' || trim(p_notes)
            ELSE '[Direct Website Pay-at-Property Booking]'
        END
    ) RETURNING id INTO v_booking_id;

    -- 11. Insert primary guest record
    INSERT INTO guests (
        booking_id,
        homestay_id,
        name,
        phone,
        email,
        is_primary
    ) VALUES (
        v_booking_id,
        p_homestay_id,
        trim(p_guest_name),
        trim(p_guest_phone),
        trim(p_guest_email),
        true
    );

    RETURN jsonb_build_object(
        'booking_id', v_booking_id,
        'room_id', v_room.id,
        'room_name', v_room.name,
        'homestay_id', p_homestay_id,
        'check_in', p_check_in,
        'check_out', p_check_out,
        'nights', v_nights,
        'number_of_guests', p_number_of_guests,
        'nightly_rate', v_room.nightly_rate,
        'total_amount', v_total,
        'status', 'confirmed',
        'payment_method', 'Pay at Property'
    );
END;
$$;

-- 4. Permissions: Revoke all execute permissions from public and anon
REVOKE EXECUTE ON FUNCTION create_public_booking_atomic(UUID, UUID, DATE, DATE, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM public;
REVOKE EXECUTE ON FUNCTION create_public_booking_atomic(UUID, UUID, DATE, DATE, INTEGER, TEXT, TEXT, TEXT, TEXT) FROM anon;

-- 5. Grant execution exclusively to service_role (Node.js trusted backend)
GRANT EXECUTE ON FUNCTION create_public_booking_atomic(UUID, UUID, DATE, DATE, INTEGER, TEXT, TEXT, TEXT, TEXT) TO service_role;

NOTIFY pgrst, 'reload schema';
