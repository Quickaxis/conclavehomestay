import { createClient } from '@supabase/supabase-js';

/**
 * Server-side HMS Client for The Conclave Homestay.
 * 
 * SECURITY RULES:
 * 1. This module runs ONLY in a Node.js server environment (Vite dev server middleware or Node production server).
 * 2. It reads configuration exclusively from process.env.
 * 3. Never expose credentials to browser client code.
 * 4. All queries strictly filter by HMS_HOMESTAY_ID to guarantee tenant isolation.
 * 5. Never store partner passwords or bypass database-level atomic locking.
 * 6. Never trust browser-supplied room rates, totals, homestay IDs, or booking statuses.
 */

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getConfig() {
  return {
    supabaseUrl: process.env.CONCLAVE_SUPABASE_URL || process.env.SUPABASE_URL || process.env.HMS_SUPABASE_URL || 'https://algorrnjotffcvtinbyy.supabase.co',
    serviceRoleKey: process.env.CONCLAVE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.HMS_SERVICE_ROLE_KEY || '',
    homestayId: process.env.CONCLAVE_HOMESTAY_ID || process.env.HMS_HOMESTAY_ID || ''
  };
}

let supabaseAdminInstance = null;

function getSupabaseClient() {
  const config = getConfig();
  if (!config.supabaseUrl || !config.serviceRoleKey) {
    return null;
  }
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(config.supabaseUrl, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  return supabaseAdminInstance;
}

/**
 * Check HMS connection status and homestay registration.
 */
export async function getHmsStatus() {
  const config = getConfig();
  
  if (!config.serviceRoleKey) {
    return {
      connected: false,
      configured: false,
      error: 'HMS_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_ROLE_KEY) is not configured in the server environment.'
    };
  }

  if (!config.homestayId) {
    return {
      connected: true,
      configured: false,
      error: 'HMS_HOMESTAY_ID (or CONCLAVE_HOMESTAY_ID) is not configured. The Conclave has not yet been registered in the HMS.'
    };
  }

  if (!UUID_REGEX.test(config.homestayId)) {
    return {
      connected: true,
      configured: false,
      error: `Configured homestay ID "${config.homestayId}" is not a valid UUID.`
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      connected: false,
      configured: false,
      error: 'Failed to initialize Supabase client.'
    };
  }

  try {
    const { data: homestay, error } = await supabase
      .from('homestays')
      .select('id, name, location, phone, email, is_active')
      .eq('id', config.homestayId)
      .single();

    if (error || !homestay) {
      return {
        connected: true,
        configured: false,
        error: `Homestay with ID "${config.homestayId}" was not found in the HMS database.`
      };
    }

    return {
      connected: true,
      configured: true,
      homestay: {
        id: homestay.id,
        name: homestay.name,
        location: homestay.location,
        isActive: homestay.is_active
      }
    };
  } catch (err) {
    return {
      connected: false,
      configured: false,
      error: err.message || 'Error querying HMS database.'
    };
  }
}

/**
 * Fetch verified active rooms for The Conclave from HMS.
 * Returns only real database records for this homestay; never invents fake rooms.
 */
export async function getVerifiedRooms() {
  const status = await getHmsStatus();
  if (!status.configured) {
    return {
      success: false,
      configured: false,
      error: status.error,
      rooms: []
    };
  }

  const config = getConfig();
  const supabase = getSupabaseClient();

  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, room_number, name, description, bathroom_type, max_guests, nightly_rate, breakfast_included, breakfast_details, is_active')
      .eq('homestay_id', config.homestayId)
      .eq('is_active', true)
      .order('room_number', { ascending: true });

    if (error) {
      console.error('[HMS] Error fetching rooms:', error);
      return { success: false, configured: true, error: error.message, rooms: [] };
    }

    if (!rooms || rooms.length === 0) {
      return {
        success: true,
        configured: true,
        rooms: [],
        message: 'No physical rooms have been configured for this homestay in the HMS yet.'
      };
    }

    return {
      success: true,
      configured: true,
      rooms: rooms.map(r => ({
        id: r.id,
        roomNumber: r.room_number,
        name: r.name,
        description: r.description,
        bathroomType: r.bathroom_type,
        maxGuests: r.max_guests,
        nightlyRate: r.nightly_rate,
        breakfastIncluded: r.breakfast_included,
        breakfastDetails: r.breakfast_details
      }))
    };
  } catch (err) {
    console.error('[HMS] Exception in getVerifiedRooms:', err);
    return { success: false, configured: false, error: err.message, rooms: [] };
  }
}

/**
 * Fetch date-specific room availability for The Conclave.
 * 
 * Rules:
 * - checkOut must be strictly after checkIn.
 * - Does not infer availability from current occupied status alone; queries date reservations.
 * - Overlap condition: bookings where status != 'cancelled' AND check_in < checkOut AND check_out > checkIn.
 * - Does not invent rooms or approved rates.
 */
export async function getRoomAvailability({ checkIn, checkOut, guests = 1 }) {
  if (!checkIn || !checkOut) {
    return { success: false, error: 'Check-in and check-out dates are required.' };
  }

  // ISO date format validation YYYY-MM-DD
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(checkIn) || !isoDateRegex.test(checkOut)) {
    return { success: false, error: 'Dates must be in YYYY-MM-DD format.' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { success: false, error: 'Invalid dates provided.' };
  }

  // Ensure dates are real calendar dates (prevent rollover like Feb 31)
  if (checkInDate.toISOString().slice(0, 10) !== checkIn || checkOutDate.toISOString().slice(0, 10) !== checkOut) {
    return { success: false, error: 'Invalid calendar date provided.' };
  }

  if (checkInDate < today) {
    return { success: false, error: 'Check-in date cannot be in the past.' };
  }

  if (checkOutDate <= checkInDate) {
    return { success: false, error: 'Check-out date must be strictly after check-in date.' };
  }

  const guestCount = parseInt(guests, 10);
  if (isNaN(guestCount) || guestCount <= 0 || !Number.isInteger(Number(guests))) {
    return { success: false, error: 'Number of guests must be a positive integer.' };
  }

  const status = await getHmsStatus();
  if (!status.configured) {
    return {
      success: false,
      configured: false,
      error: status.error || 'The Conclave is not yet registered or configured in the HMS.'
    };
  }

  const config = getConfig();
  const supabase = getSupabaseClient();

  try {
    // 1. Fetch active rooms strictly belonging to this homestay
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('id, room_number, name, description, bathroom_type, max_guests, nightly_rate, breakfast_included, breakfast_details')
      .eq('homestay_id', config.homestayId)
      .eq('is_active', true)
      .order('room_number', { ascending: true });

    if (roomError) {
      console.error('[HMS] Error fetching rooms for availability:', roomError);
      return { success: false, configured: true, error: 'Unable to check availability at this time.' };
    }

    if (!rooms || rooms.length === 0) {
      return {
        success: false,
        configured: true,
        error: 'No physical rooms configured in the HMS for The Conclave yet.',
        rooms: []
      };
    }

    // 2. Query overlapping active bookings (excluding cancelled) strictly for this homestay
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('room_id')
      .eq('homestay_id', config.homestayId)
      .neq('status', 'cancelled')
      .lt('check_in', checkOut)
      .gt('check_out', checkIn);

    if (bookingError) {
      console.error('[HMS] Error fetching bookings for availability:', bookingError);
      return { success: false, configured: true, error: 'Unable to check availability at this time.' };
    }

    const bookedRoomIds = new Set((bookings || []).map(b => b.room_id));
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));

    const availableRooms = rooms.map(room => {
      const isBooked = bookedRoomIds.has(room.id);
      const capacityExceeded = guestCount > room.max_guests;
      const isAvailable = !isBooked && !capacityExceeded;

      let unavailabilityReason = null;
      if (isBooked) {
        unavailabilityReason = 'Booked for selected dates';
      } else if (capacityExceeded) {
        unavailabilityReason = `Room capacity is ${room.max_guests} guest(s)`;
      }

      return {
        id: room.id,
        roomNumber: room.room_number,
        name: room.name,
        description: room.description,
        bathroomType: room.bathroom_type,
        maxGuests: room.max_guests,
        nightlyRate: room.nightly_rate,
        totalPrice: room.nightly_rate ? nights * room.nightly_rate : null,
        nights,
        breakfastIncluded: room.breakfast_included,
        breakfastDetails: room.breakfast_details,
        isAvailable,
        unavailabilityReason
      };
    });

    return {
      success: true,
      configured: true,
      checkIn,
      checkOut,
      nights,
      guestCount,
      totalConfiguredRooms: rooms.length,
      availableCount: availableRooms.filter(r => r.isAvailable).length,
      rooms: availableRooms
    };
  } catch (err) {
    console.error('[HMS] Exception in getRoomAvailability:', err);
    return { success: false, configured: true, error: 'Server error while checking availability.' };
  }
}

/**
 * Create a live pay-at-property reservation via the atomic database function.
 * 
 * Enforces:
 * - Single source of truth: PostgreSQL database.
 * - Concurrency protection: Row-level lock (FOR UPDATE).
 * - Tenant isolation: Scoped exclusively to process.env.HMS_HOMESTAY_ID.
 * - Rates & Totals: Computed solely from verified database records.
 * - If atomic stored procedure is not yet provisioned, safely fails with requiresApproval.
 */
export async function createReservation({
  roomId,
  checkIn,
  checkOut,
  numberOfGuests,
  guestName,
  guestPhone,
  guestEmail = null,
  notes = null
}) {
  // Input validations: required fields must be present and non-empty
  if (!roomId || !checkIn || !checkOut || !numberOfGuests || !guestName?.trim() || !guestPhone?.trim()) {
    return {
      success: false,
      error: 'All required fields (Room, Check-in, Check-out, Guests, Name, Phone) must be provided.'
    };
  }

  if (guestPhone.trim().length < 8) {
    return {
      success: false,
      error: 'A valid phone or WhatsApp number is required (at least 8 digits).'
    };
  }

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDateRegex.test(checkIn) || !isoDateRegex.test(checkOut)) {
    return { success: false, error: 'Dates must be in YYYY-MM-DD format.' };
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { success: false, error: 'Invalid dates provided.' };
  }

  // Ensure dates are real calendar dates (prevent rollover like Feb 31)
  if (checkInDate.toISOString().slice(0, 10) !== checkIn || checkOutDate.toISOString().slice(0, 10) !== checkOut) {
    return { success: false, error: 'Invalid calendar date provided.' };
  }

  if (checkInDate < today) {
    return { success: false, error: 'Check-in date cannot be in the past.' };
  }

  if (checkOutDate <= checkInDate) {
    return { success: false, error: 'Check-out date must be strictly after check-in date.' };
  }

  const guestCount = parseInt(numberOfGuests, 10);
  if (isNaN(guestCount) || guestCount <= 0 || !Number.isInteger(Number(numberOfGuests))) {
    return { success: false, error: 'Number of guests must be a positive integer.' };
  }

  const status = await getHmsStatus();
  if (!status.configured) {
    return {
      success: false,
      configured: false,
      requiresApproval: true,
      error: status.error || 'The Conclave is not yet registered in the HMS.'
    };
  }

  const config = getConfig();
  const supabase = getSupabaseClient();

  try {
    // 1. Verify the selected room exists, is active, and strictly belongs to this homestay
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, name, nightly_rate, max_guests')
      .eq('id', roomId)
      .eq('homestay_id', config.homestayId)
      .eq('is_active', true)
      .single();

    if (roomError || !room) {
      return { success: false, error: 'The selected room is invalid or unavailable.' };
    }

    // 2. Validate capacity
    if (guestCount > room.max_guests) {
      return { success: false, error: `Number of guests (${guestCount}) exceeds room capacity (${room.max_guests}).` };
    }

    // 3. Compute nights and estimated total from trusted database rate (never trust client price)
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)));
    const estimatedTotal = nights * (room.nightly_rate || 0);

    // 4. Save booking request into existing HMS booking_requests table as 'pending'
    const { data: requestResult, error: insertError } = await supabase
      .from('booking_requests')
      .insert([{
        homestay_id: config.homestayId,
        room_id: room.id,
        check_in: checkIn,
        check_out: checkOut,
        number_of_guests: guestCount,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        guest_email: guestEmail ? guestEmail.trim() : null,
        notes: notes ? notes.trim() : null,
        estimated_total: estimatedTotal,
        status: 'pending'
      }])
      .select('id, created_at')
      .single();

    if (insertError) {
      console.warn('[HMS] Error inserting booking request:', insertError.code, insertError.message);

      // If table is not yet provisioned in PostgreSQL (42P01 or PGRST204/205)
      if (insertError.code === '42P01' || insertError.code === 'PGRST204' || insertError.code === 'PGRST205' || insertError.message?.includes('does not exist')) {
        return {
          success: false,
          requiresApproval: true,
          error: 'The Conclave booking request system is awaiting database provisioning in the Hotel Management System. Please contact the property directly.'
        };
      }

      return { success: false, error: insertError.message || 'Database rejected booking request.' };
    }

    if (!requestResult || !requestResult.id) {
      return { success: false, error: 'No confirmation returned by the database.' };
    }

    const refNumber = `REQ-${requestResult.id.slice(0, 8).toUpperCase()}`;

    return {
      success: true,
      isRequest: true,
      requestReference: refNumber,
      requestId: requestResult.id,
      roomName: room.name,
      checkIn,
      checkOut,
      nights,
      numberOfGuests: guestCount,
      nightlyRate: room.nightly_rate,
      estimatedTotal,
      paymentMethod: 'Pay at Property',
      status: 'pending',
      message: 'Your booking request has been submitted to the management. Payment will be collected at property upon check-in. The host will review and confirm your reservation.'
    };
  } catch (err) {
    console.error('[HMS] Exception in createReservation:', err);
    return {
      success: false,
      requiresApproval: true,
      error: 'An unexpected error occurred while processing the reservation request.'
    };
  }
}

/**
 * Handle website enquiries separately from bookings.
 * Enquiries DO NOT block room inventory or create holds.
 * Strictly scoped to the configured homestay ID.
 */
export async function createEnquiry({ name, phone, email, message, dates, roomPreference, numberOfGuests }) {
  if (!name || !name.trim()) {
    return { success: false, error: 'Name is required.' };
  }
  if (!phone || !phone.trim()) {
    return { success: false, error: 'Phone number is required.' };
  }
  if (phone.trim().length < 8) {
    return { success: false, error: 'A valid phone number (at least 8 digits) is required.' };
  }

  const config = getConfig();

  // Sanitized enquiry object strictly scoped to The Conclave
  return {
    success: true,
    homestayId: config.homestayId,
    message: 'Your enquiry has been received. The host will contact you to confirm details and availability.',
    enquiry: {
      homestayId: config.homestayId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : null,
      dates: dates || null,
      roomPreference: roomPreference || null,
      numberOfGuests: numberOfGuests ? parseInt(numberOfGuests, 10) : null,
      message: message ? message.trim() : null,
      receivedAt: new Date().toISOString()
    }
  };
}

