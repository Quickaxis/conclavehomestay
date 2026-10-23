export interface DbBookingRequest {
  id: string;
  homestay_id: string;
  room_id: string | null;
  booking_id?: string | null;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  number_of_guests: number;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  notes: string | null;
  estimated_total: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  // Joined relation
  rooms?: {
    id: string;
    room_number: string;
    name: string;
    nightly_rate: number;
  } | null;
}
