import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BookingContext = createContext(null);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

// Backwards compatibility alias
export const useBookingModal = useBooking;

export const BookingProvider = ({ children }) => {
  // Modal visibility and prefill configuration
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    roomId: null,
    mode: 'book' // 'book' | 'enquiry'
  });

  // Today and Tomorrow formatted as YYYY-MM-DD
  const getTodayString = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const getDayAfterTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  // Date and guest selection state
  const [checkIn, setCheckIn] = useState(getTomorrowString());
  const [checkOut, setCheckOut] = useState(getDayAfterTomorrowString());
  const [guests, setGuests] = useState(2);

  // HMS status and room availability state
  const [hmsStatus, setHmsStatus] = useState({
    connected: false,
    configured: false,
    error: null,
    homestay: null
  });
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const [availabilityData, setAvailabilityData] = useState(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState(null);

  // Verified rooms fetched from HMS
  const [verifiedHmsRooms, setVerifiedHmsRooms] = useState([]);

  // Check HMS integration status on mount
  const checkStatus = useCallback(async () => {
    try {
      setIsLoadingStatus(true);
      const res = await fetch('/api/hms/status');
      if (res.ok) {
        const data = await res.json();
        setHmsStatus(data);
      } else {
        setHmsStatus({
          connected: false,
          configured: false,
          error: 'HMS service endpoint unreachable.'
        });
      }
    } catch (err) {
      console.warn('[BookingContext] HMS status check failed:', err);
      setHmsStatus({
        connected: false,
        configured: false,
        error: 'Unable to connect to HMS integration layer.'
      });
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  // Fetch verified rooms
  const fetchVerifiedRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/hms/rooms');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.rooms)) {
          setVerifiedHmsRooms(data.rooms);
        }
      }
    } catch (err) {
      console.warn('[BookingContext] Could not fetch verified rooms:', err);
    }
  }, []);

  // Check date-specific availability
  const checkAvailability = useCallback(async (inDate = checkIn, outDate = checkOut, guestCount = guests) => {
    if (!inDate || !outDate) {
      setAvailabilityError('Please select both check-in and check-out dates.');
      return null;
    }

    if (new Date(outDate) <= new Date(inDate)) {
      setAvailabilityError('Check-out date must be strictly after check-in date.');
      return null;
    }

    setIsCheckingAvailability(true);
    setAvailabilityError(null);

    try {
      const query = new URLSearchParams({
        checkIn: inDate,
        checkOut: outDate,
        guests: guestCount.toString()
      });

      const res = await fetch(`/api/hms/availability?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setAvailabilityData(data);
        return data;
      } else {
        setAvailabilityError(data.error || 'Unable to check availability at this time.');
        setAvailabilityData(null);
        return null;
      }
    } catch (err) {
      console.error('[BookingContext] Error checking availability:', err);
      setAvailabilityError('Network error while checking live availability.');
      setAvailabilityData(null);
      return null;
    } finally {
      setIsCheckingAvailability(false);
    }
  }, [checkIn, checkOut, guests]);

  // Initial load
  useEffect(() => {
    checkStatus().then(() => {
      fetchVerifiedRooms();
    });
  }, [checkStatus, fetchVerifiedRooms]);

  // Trigger availability check when status is ready
  useEffect(() => {
    if (hmsStatus.configured) {
      checkAvailability(checkIn, checkOut, guests);
    }
  }, [hmsStatus.configured]);

  // Modal open & close
  const openModal = useCallback((config = {}) => {
    setModalConfig({
      roomId: config.roomId || null,
      mode: config.mode || 'book'
    });
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  // Submit live pay-at-property reservation
  const submitBooking = async (bookingPayload) => {
    try {
      const res = await fetch('/api/hms/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Refresh availability in background
        checkAvailability(checkIn, checkOut, guests);
        return { success: true, data };
      } else {
        return { success: false, error: data.error || 'Booking submission failed.' };
      }
    } catch (err) {
      return { success: false, error: err.message || 'Network error while booking.' };
    }
  };

  // Submit general enquiry
  const submitEnquiry = async (enquiryPayload) => {
    try {
      const res = await fetch('/api/hms/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enquiryPayload)
      });
      const data = await res.json();
      return { success: res.ok && Boolean(data.success), data, error: data.error };
    } catch (err) {
      return { success: false, error: err.message || 'Network error while submitting enquiry.' };
    }
  };

  const value = {
    // Modal
    isModalOpen,
    modalConfig,
    openModal,
    closeModal,

    // Dates and Guests
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    minCheckInDate: getTodayString(),

    // HMS integration state
    hmsStatus,
    isLoadingStatus,
    verifiedHmsRooms,

    // Live Availability
    availabilityData,
    isCheckingAvailability,
    availabilityError,
    checkAvailability,

    // Actions
    submitBooking,
    submitEnquiry
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
