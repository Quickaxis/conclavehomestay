import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Calendar, 
  Users, 
  CheckCircle, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  RefreshCw,
  ArrowRight,
  Clock,
  CalendarX,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { roomsData } from '../data/rooms';
import styles from './BookYourStayModal.module.css';

const BookYourStayModal = () => {
  const { 
    isModalOpen, 
    modalConfig, 
    closeModal,
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    minCheckInDate,
    verifiedHmsRooms,
    submitBooking,
    submitEnquiry
  } = useBooking();

  const modalRef = useRef(null);

  // Determine whether real physical rooms are provisioned in HMS
  const hasVerifiedRooms = Array.isArray(verifiedHmsRooms) && verifiedHmsRooms.length > 0;

  // Selected Room ID
  const [selectedRoomId, setSelectedRoomId] = useState(modalConfig?.roomId || '');

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [requestSuccessData, setRequestSuccessData] = useState(null);
  const [enquirySuccessData, setEnquirySuccessData] = useState(null);

  // Friendly Unavailable State & Live Alternatives
  const [isUnavailableState, setIsUnavailableState] = useState(false);
  const [alternativesList, setAlternativesList] = useState([]);
  const [isLoadingAlternatives, setIsLoadingAlternatives] = useState(false);
  const [alternativesError, setAlternativesError] = useState(null);
  const [roomChangedNotice, setRoomChangedNotice] = useState(null);

  // Sync modalConfig when modal opens
  useEffect(() => {
    if (isModalOpen) {
      if (modalConfig?.roomId) {
        // Resolve static slug to actual HMS room UUID if verified HMS rooms are active
        const matchedHmsRoom = hasVerifiedRooms ? verifiedHmsRooms.find(r => {
          if (r.id === modalConfig.roomId || r.legacyId === modalConfig.roomId) return true;
          if (r.roomNumber) {
            const cleanNum = String(r.roomNumber).trim().replace(/^room\s*/i, '').replace(/^0+/, '');
            const padNum = cleanNum.padStart(2, '0');
            return modalConfig.roomId === `room-${padNum}` ||
                   modalConfig.roomId === `room-${cleanNum}` ||
                   modalConfig.roomId === `the-vista-room-${padNum}` ||
                   modalConfig.roomId === `the-comfort-room-${padNum}` ||
                   (modalConfig.roomId === 'the-grand-suite' && (cleanNum === '3' || padNum === '03'));
          }
          return false;
        }) : null;

        setSelectedRoomId(matchedHmsRoom ? matchedHmsRoom.id : modalConfig.roomId);
      } else {
        const defaultRoom = (hasVerifiedRooms ? verifiedHmsRooms[0].id : roomsData[0]?.id) || '';
        setSelectedRoomId(defaultRoom);
      }
      setFormError('');
      setRequestSuccessData(null);
      setEnquirySuccessData(null);
      setIsUnavailableState(false);
      setAlternativesList([]);
      setAlternativesError(null);
      setRoomChangedNotice(null);
    }
  }, [isModalOpen, modalConfig, hasVerifiedRooms, verifiedHmsRooms]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen) return null;

  // Resolve room details - uses real HMS rooms if active, otherwise the 6 confirmed rooms
  const availableRoomsList = verifiedHmsRooms.length > 0 
    ? verifiedHmsRooms 
    : roomsData.map(r => ({
        id: r.id,
        legacyId: r.legacyId,
        name: r.name,
        category: r.category,
        roomNumber: r.detail,
        nightlyRate: r.price,
        maxGuests: 3,
        description: r.description
      }));

  const activeRoom = availableRoomsList.find(r => {
    if (r.id === selectedRoomId || r.legacyId === selectedRoomId) return true;
    if (r.roomNumber) {
      const cleanNum = String(r.roomNumber).trim().replace(/^room\s*/i, '').replace(/^0+/, '');
      const padNum = cleanNum.padStart(2, '0');
      return selectedRoomId === `room-${padNum}` ||
             selectedRoomId === `room-${cleanNum}` ||
             selectedRoomId === `the-vista-room-${padNum}` ||
             selectedRoomId === `the-comfort-room-${padNum}` ||
             (selectedRoomId === 'the-grand-suite' && (cleanNum === '3' || padNum === '03'));
    }
    return false;
  }) || availableRoomsList[0];

  // Calculate nights
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = (!isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime()) && checkOutDate > checkInDate)
    ? Math.max(1, Math.round((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)))
    : 1;

  // Derive rate availability safely from the verified selected room and its valid nightly rate
  const hasLiveRate = Boolean(activeRoom && typeof activeRoom.nightlyRate === 'number' && activeRoom.nightlyRate > 0);

  // Multi-night estimate calculated from the selected room's configured nightly rate
  const activeRate = hasLiveRate ? activeRoom.nightlyRate : null;
  const estimatedTotalPrice = (activeRate && nights) ? activeRate * nights : null;

  // Helper: Detect room-unavailable error from API
  const isRoomUnavailableError = (errorMsg) => {
    if (!errorMsg || typeof errorMsg !== 'string') return false;
    return /no longer available|already booked|just booked|unavailable|dates unavailable/i.test(errorMsg);
  };

  // Fetch verified live alternatives from /api/hms/availability
  const loadLiveAlternatives = async (inDate, outDate, guestCount, currentRoomId) => {
    if (!inDate || !outDate) return;
    setIsLoadingAlternatives(true);
    setAlternativesError(null);

    try {
      const query = new URLSearchParams({
        checkIn: inDate,
        checkOut: outDate,
        guests: String(guestCount || 1)
      });

      const res = await fetch(`/api/hms/availability?${query.toString()}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.rooms)) {
        // Exclude the current unavailable room, ensure isAvailable is true, and enforce capacity
        const validAlternatives = data.rooms.filter(r =>
          r.id !== currentRoomId &&
          r.isAvailable === true &&
          r.maxGuests >= parseInt(guestCount || 1, 10)
        );
        setAlternativesList(validAlternatives);
      } else {
        setAlternativesError(data.error || 'Unable to check live room availability at this time.');
        setAlternativesList([]);
      }
    } catch (err) {
      console.error('[BookYourStayModal] Failed to fetch live alternatives:', err);
      setAlternativesError('Network error while checking live availability.');
      setAlternativesList([]);
    } finally {
      setIsLoadingAlternatives(false);
    }
  };

  // One-click alternative selection: switch room, preserve all customer details
  const handleSelectAlternative = (altRoom) => {
    setSelectedRoomId(altRoom.id);
    setIsUnavailableState(false);
    setFormError('');
    setRoomChangedNotice(`Room changed to "${altRoom.name}". Ready to confirm your stay!`);
    setTimeout(() => {
      setRoomChangedNotice(null);
    }, 6000);
  };

  // Change dates action: shift focus to check-in input
  const handleChangeDates = () => {
    const checkInInput = document.getElementById('modal-checkin');
    if (checkInInput) {
      checkInInput.focus();
      checkInInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Form submission handler: submits booking request directly to HMS
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    setRoomChangedNotice(null);

    if (!selectedRoomId) {
      setFormError('Please select a room.');
      return;
    }
    if (!checkIn || !checkOut) {
      setFormError('Please select check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setFormError('Check-out date must be strictly after check-in date.');
      return;
    }
    if (!guestName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 8) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      roomId: selectedRoomId,
      checkIn,
      checkOut,
      numberOfGuests: parseInt(guests, 10) || 1,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || null,
      notes: specialRequests.trim() || null
    };

    const result = await submitBooking(payload);
    setIsSubmitting(false);

    if (result.success) {
      setIsUnavailableState(false);
      setRequestSuccessData(result.data);
    } else {
      if (isRoomUnavailableError(result.error)) {
        setIsUnavailableState(true);
        setFormError('');
        loadLiveAlternatives(checkIn, checkOut, guests, selectedRoomId);
      } else {
        setIsUnavailableState(false);
        setFormError(result.error || 'Failed to confirm reservation. Please check details or try again later.');
      }
    }
  };

  // Form submission handler for stay enquiries when rooms are still in setup
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!guestName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.trim().length < 8) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: guestName.trim(),
      phone: guestPhone.trim(),
      email: guestEmail.trim() || null,
      dates: `${checkIn} to ${checkOut}`,
      roomPreference: activeRoom ? `${activeRoom.name}${hasLiveRate ? ` (₹${activeRate.toLocaleString()}/night)` : ''}` : 'Any Room',
      numberOfGuests: parseInt(guests, 10) || 1,
      message: specialRequests.trim() || null
    };

    const result = await submitEnquiry(payload);
    setIsSubmitting(false);

    if (result.success) {
      setEnquirySuccessData(result.data);
    } else {
      setFormError(result.error || 'Failed to submit stay enquiry. Please try again later.');
    }
  };

  return (
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className={styles.modal} ref={modalRef}>
        <button 
          className={styles.closeBtn} 
          onClick={closeModal}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <img 
            src="/images/logo.jpg" 
            alt="The Conclave Logo" 
            className={styles.modalLogo} 
          />
          <div>
            <h2 id="booking-modal-title" className={styles.title}>
              THE CONCLAVE
            </h2>
            <p className={styles.subtitle}>
              LODGING AND HOMESTAY • KHANIKAR, DIBRUGARH
            </p>
          </div>
        </div>

        {/* View 1: Enquiry Success View (when rooms are in setup) */}
        {enquirySuccessData ? (
          <div className={styles.successContainer}>
            <div className={styles.successIconBadge}>
              <CheckCircle size={42} className={styles.successIcon} />
            </div>
            <h3 className={styles.successHeading}>STAY ENQUIRY RECEIVED</h3>
            <p className={styles.successSubtitle}>
              Thank you, {guestName}! We have received your inquiry. Please note that an enquiry is not a confirmed booking. Our team will contact you once direct online room reservations are officially open.
            </p>

            <div className={styles.receiptCard}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>ENQUIRY STATUS:</span>
                <span className={styles.statusBadge}>
                  <Clock size={12} /> Received • Pending Room Setup Launch
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>PREFERRED DATES:</span>
                <span className={styles.receiptVal}>{checkIn} &rarr; {checkOut} ({nights} night{nights > 1 ? 's' : ''})</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>GUESTS:</span>
                <span className={styles.receiptVal}>{guests} Guest{guests > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>PREFERRED ROOM:</span>
                <span className={styles.receiptVal}>{activeRoom?.name}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>ESTIMATED PAYABLE:</span>
                <span className={styles.receiptPrice}>₹{estimatedTotalPrice.toLocaleString()} ({nights} night{nights > 1 ? 's' : ''})</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>PAYMENT POLICY:</span>
                <span className={styles.payBadge}>
                  <CreditCard size={12} /> Pay at Property upon Host Confirmation
                </span>
              </div>
            </div>

            <div className={styles.infoCallout}>
              <ShieldCheck size={16} />
              <span>Zero upfront payment. Rates and bookings will be finalized directly with the host upon property opening.</span>
            </div>

            <div className={styles.successActions}>
              <button onClick={closeModal} className={styles.doneBtn}>
                DONE
              </button>
            </div>
          </div>
        ) : requestSuccessData ? (
          /* View 2: Instant Booking Confirmed (when real rooms are active in HMS) */
          <div className={styles.successContainer}>
            <div className={styles.successIconBadge}>
              <CheckCircle size={42} className={styles.successIcon} />
            </div>
            <h3 className={styles.successHeading}>RESERVATION CONFIRMED</h3>
            <p className={styles.successSubtitle}>
              Thank you, {guestName}! Your reservation at The Conclave is confirmed. Payment is due at property upon check-in.
            </p>

            <div className={styles.receiptCard}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>BOOKING REFERENCE:</span>
                <span className={styles.receiptRef}>
                  {requestSuccessData.bookingReference || requestSuccessData.bookingId || requestSuccessData.requestReference}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>STATUS:</span>
                <span className={styles.statusBadge} style={{ background: '#E6F4EA', color: '#137333' }}>
                  <CheckCircle size={12} /> Confirmed (Pay at Property)
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>ROOM:</span>
                <span className={styles.receiptVal}>{requestSuccessData.roomName || activeRoom?.name}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>DATES:</span>
                <span className={styles.receiptVal}>{checkIn} &rarr; {checkOut} ({nights} night{nights > 1 ? 's' : ''})</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>GUESTS:</span>
                <span className={styles.receiptVal}>{guests} Guest{guests > 1 ? 's' : ''}</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>TOTAL PAYABLE:</span>
                <span className={styles.receiptPrice}>
                  {requestSuccessData.totalAmount ? `₹${requestSuccessData.totalAmount.toLocaleString()}` : (requestSuccessData.estimatedTotal ? `₹${requestSuccessData.estimatedTotal.toLocaleString()}` : 'Confirmed at property')}
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>PAYMENT METHOD:</span>
                <span className={styles.payBadge}>
                  <CreditCard size={12} /> Pay at Property
                </span>
              </div>
            </div>

            <div className={styles.infoCallout}>
              <ShieldCheck size={16} />
              <span>Zero upfront payment required. Your room is reserved and confirmed directly in our Hotel Management System.</span>
            </div>

            <div className={styles.successActions}>
              <button onClick={closeModal} className={styles.doneBtn}>
                DONE
              </button>
            </div>
          </div>
        ) : !hasVerifiedRooms ? (
          /* View 3: Room Setup in Progress / Stay Enquiry Form */
          <div className={styles.formContainer}>
            <div className={styles.formHeaderRow}>
              <div>
                <h3 className={styles.formTitle}>ROOM SETUP IN PROGRESS</h3>
                <p style={{ fontSize: '12px', color: 'var(--color-gold)', margin: '2px 0 0', fontWeight: '600' }}>
                  Online Booking Coming Soon
                </p>
              </div>
              <span className={styles.payAtPropertyPill}>Pay at Property</span>
            </div>

            <div className={styles.infoCallout} style={{ marginBottom: '16px', background: 'var(--color-cream, #F7F5F0)' }}>
              <Clock size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
              <span style={{ fontSize: '12.5px', lineHeight: '1.45' }}>
                The Conclave is currently finalizing physical room configurations, capacities, and approved nightly rates in the Hotel Management System. Direct online booking requests will activate automatically once physical room setup is complete.
              </span>
            </div>

            {formError && (
              <div className={styles.formAlert}>
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEnquirySubmit} className={styles.form}>
              
              {/* Room Selection */}
              <div className={styles.fieldGroup}>
                <label htmlFor="modal-enquiry-room-select" className={styles.fieldLabel}>
                  SELECT ROOM
                </label>
                <select
                  id="modal-enquiry-room-select"
                  value={activeRoom?.id || selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className={styles.select}
                >
                  {availableRoomsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} — ₹{r.nightlyRate?.toLocaleString()}/night
                    </option>
                  ))}
                </select>
              </div>

              {/* Preferred Dates & Guests Grid */}
              <div className={styles.gridRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-checkin" className={styles.fieldLabel}>
                    <Calendar size={12} /> CHECK-IN
                  </label>
                  <input
                    id="modal-checkin"
                    type="date"
                    min={minCheckInDate}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-checkout" className={styles.fieldLabel}>
                    <Calendar size={12} /> CHECK-OUT
                  </label>
                  <input
                    id="modal-checkout"
                    type="date"
                    min={checkIn || minCheckInDate}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guests" className={styles.fieldLabel}>
                    <Users size={12} /> GUESTS
                  </label>
                  <select
                    id="modal-guests"
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                    className={styles.select}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Rate Notice */}
              <div className={styles.pricingSummaryBox}>
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>
                    {activeRoom?.name} {hasLiveRate ? `(₹${activeRate.toLocaleString()} × ${nights} night${nights > 1 ? 's' : ''})` : ''}
                  </span>
                  <span className={styles.pricingValue}>
                    {estimatedTotalPrice ? `₹${estimatedTotalPrice.toLocaleString()}` : 'Confirmed upon Host Review'}
                  </span>
                </div>
                <div className={styles.pricingNotice}>
                  <ShieldCheck size={13} className={styles.goldIcon} />
                  <span>Stay Enquiry • Payment due upon arrival directly at property. No inventory is locked.</span>
                </div>
              </div>

              {/* Guest Details */}
              <div className={styles.fieldGroup}>
                <label htmlFor="modal-guest-name" className={styles.fieldLabel}>
                  YOUR FULL NAME *
                </label>
                <input
                  id="modal-guest-name"
                  type="text"
                  placeholder="Full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.gridRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guest-phone" className={styles.fieldLabel}>
                    PHONE NUMBER *
                  </label>
                  <input
                    id="modal-guest-phone"
                    type="tel"
                    placeholder="+91 ..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guest-email" className={styles.fieldLabel}>
                    EMAIL (OPTIONAL)
                  </label>
                  <input
                    id="modal-guest-email"
                    type="email"
                    placeholder="name@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="modal-notes" className={styles.fieldLabel}>
                  MESSAGE / STAY PREFERENCES
                </label>
                <input
                  id="modal-notes"
                  type="text"
                  placeholder="Any questions about dates, rooms or special preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className={styles.confirmBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className={styles.spinner} />
                    <span>SENDING STAY ENQUIRY...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT STAY ENQUIRY</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* View 4: Live Direct Booking Form (when real physical rooms exist in HMS) */
          <div className={styles.formContainer}>
            <div className={styles.formHeaderRow}>
              <h3 className={styles.formTitle}>CONFIRM RESERVATION</h3>
              <span className={styles.payAtPropertyPill}>Pay at Property</span>
            </div>

            {/* Room Changed Confirmation Notice */}
            {roomChangedNotice && (
              <div className={styles.roomChangedAlert} role="status">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={15} className={styles.changedIcon} />
                  <span>{roomChangedNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRoomChangedNotice(null)}
                  className={styles.dismissChangedBtn}
                  aria-label="Dismiss notice"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* 1. Friendly Unavailable Room Alert */}
            {isUnavailableState && (
              <div className={styles.friendlyUnavailableAlert} role="alert" aria-live="polite">
                <div className={styles.unavailableIconWrap}>
                  <CalendarX size={18} className={styles.unavailableIcon} />
                </div>
                <div className={styles.unavailableContent}>
                  <div className={styles.unavailableHeaderRow}>
                    <h4 className={styles.unavailableTitle}>This room is already booked</h4>
                    <span className={styles.bookedPill}>Dates Unavailable</span>
                  </div>
                  <p className={styles.unavailableText}>
                    No worries! Choose another room or change your dates to continue your stay.
                  </p>
                  <div className={styles.unavailableActions}>
                    <button
                      type="button"
                      onClick={handleChangeDates}
                      className={styles.changeDatesBtn}
                    >
                      <Calendar size={12} />
                      <span>Change dates</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Recommended Live Alternatives Section */}
            {isUnavailableState && (
              <div className={styles.alternativesSection}>
                <div className={styles.alternativesHeader}>
                  <h4 className={styles.alternativesTitle}>
                    <Sparkles size={13} className={styles.goldIcon} />
                    <span>Available alternatives</span>
                  </h4>
                  {!isLoadingAlternatives && alternativesList.length > 0 && (
                    <span className={styles.alternativesCount}>
                      {alternativesList.length} available
                    </span>
                  )}
                </div>

                {isLoadingAlternatives ? (
                  <div className={styles.alternativesLoading}>
                    <RefreshCw size={16} className={styles.spinner} />
                    <span>Checking live room availability...</span>
                  </div>
                ) : alternativesError ? (
                  <div className={styles.alternativesErrorBox}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertCircle size={14} />
                      <span>{alternativesError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadLiveAlternatives(checkIn, checkOut, guests, selectedRoomId)}
                      className={styles.retryBtn}
                    >
                      <RotateCcw size={11} />
                      <span>Retry</span>
                    </button>
                  </div>
                ) : alternativesList.length > 0 ? (
                  <div className={styles.alternativesGrid}>
                    {alternativesList.map((alt) => {
                      const altTotal = alt.totalPrice || (alt.nightlyRate * nights);
                      return (
                        <div key={alt.id} className={styles.altCard}>
                          <div className={styles.altCardTop}>
                            <div>
                              <h5 className={styles.altRoomName}>{alt.name}</h5>
                              <div className={styles.altMetaRow}>
                                <span className={styles.altCapacity}>
                                  <Users size={11} /> Up to {alt.maxGuests} guests
                                </span>
                                {alt.bathroomType && (
                                  <span className={styles.altBath}>• {alt.bathroomType}</span>
                                )}
                              </div>
                            </div>
                            <span className={styles.availableBadge}>
                              <CheckCircle size={10} /> Available
                            </span>
                          </div>

                          <div className={styles.altCardBottom}>
                            <div className={styles.altPriceCol}>
                              <div className={styles.altNightly}>
                                ₹{alt.nightlyRate?.toLocaleString()} <span className={styles.perNight}>/ night</span>
                              </div>
                              <div className={styles.altTotal}>
                                ₹{altTotal?.toLocaleString()} total ({nights} night{nights > 1 ? 's' : ''})
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectAlternative(alt)}
                              className={styles.selectAltBtn}
                            >
                              <span>Select this room</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noAlternativesBox}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#555' }}>
                      All rooms are booked for {checkIn} &rarr; {checkOut}.
                    </p>
                    <button
                      type="button"
                      onClick={handleChangeDates}
                      className={styles.changeDatesHighlightBtn}
                    >
                      <Calendar size={13} />
                      <span>Try Different Dates</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Standard error banner (only shown for non-unavailable errors like validation) */}
            {formError && !isUnavailableState && (
              <div className={styles.formAlert}>
                <AlertCircle size={14} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className={styles.form}>
              
              {/* Room Selection */}
              <div className={styles.fieldGroup}>
                <label htmlFor="modal-room-select" className={styles.fieldLabel}>
                  SELECT ROOM
                </label>
                <select
                  id="modal-room-select"
                  value={selectedRoomId}
                  onChange={(e) => {
                    setSelectedRoomId(e.target.value);
                    setIsUnavailableState(false);
                    setFormError('');
                    setRoomChangedNotice(null);
                  }}
                  className={styles.select}
                >
                  {availableRoomsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.nightlyRate ? `— ₹${r.nightlyRate.toLocaleString()}/night` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates & Guests Grid */}
              <div className={styles.gridRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-checkin" className={styles.fieldLabel}>
                    <Calendar size={12} /> CHECK-IN
                  </label>
                  <input
                    id="modal-checkin"
                    type="date"
                    min={minCheckInDate}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (isUnavailableState) {
                        setIsUnavailableState(false);
                        setFormError('');
                        setRoomChangedNotice(null);
                      }
                    }}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-checkout" className={styles.fieldLabel}>
                    <Calendar size={12} /> CHECK-OUT
                  </label>
                  <input
                    id="modal-checkout"
                    type="date"
                    min={checkIn || minCheckInDate}
                    value={checkOut}
                    onChange={(e) => {
                      setCheckOut(e.target.value);
                      if (isUnavailableState) {
                        setIsUnavailableState(false);
                        setFormError('');
                        setRoomChangedNotice(null);
                      }
                    }}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guests" className={styles.fieldLabel}>
                    <Users size={12} /> GUESTS
                  </label>
                  <select
                    id="modal-guests"
                    value={guests}
                    onChange={(e) => {
                      const newGuests = parseInt(e.target.value, 10);
                      setGuests(newGuests);
                      if (isUnavailableState) {
                        loadLiveAlternatives(checkIn, checkOut, newGuests, selectedRoomId);
                      }
                    }}
                    className={styles.select}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className={styles.pricingSummaryBox}>
                <div className={styles.pricingRow}>
                  <span className={styles.pricingLabel}>
                    {hasLiveRate ? `₹${activeRoom.nightlyRate.toLocaleString()} × ${nights} night${nights > 1 ? 's' : ''}` : 'Room Rate Status'}
                  </span>
                  <span className={styles.pricingValue}>
                    {estimatedTotalPrice ? `₹${estimatedTotalPrice.toLocaleString()}` : 'Calculated at Booking'}
                  </span>
                </div>
                <div className={styles.pricingNotice}>
                  <ShieldCheck size={13} className={styles.goldIcon} />
                  <span>Pay at Property • Your reservation is confirmed directly in the Hotel Management System.</span>
                </div>
              </div>

              {/* Guest Details */}
              <div className={styles.fieldGroup}>
                <label htmlFor="modal-guest-name" className={styles.fieldLabel}>
                  YOUR FULL NAME *
                </label>
                <input
                  id="modal-guest-name"
                  type="text"
                  placeholder="Full name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.gridRow}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guest-phone" className={styles.fieldLabel}>
                    PHONE NUMBER *
                  </label>
                  <input
                    id="modal-guest-phone"
                    type="tel"
                    placeholder="+91 ..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={styles.input}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modal-guest-email" className={styles.fieldLabel}>
                    EMAIL (OPTIONAL)
                  </label>
                  <input
                    id="modal-guest-email"
                    type="email"
                    placeholder="name@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="modal-notes" className={styles.fieldLabel}>
                  SPECIAL REQUESTS / ARRIVAL TIME
                </label>
                <input
                  id="modal-notes"
                  type="text"
                  placeholder="Estimated arrival time or preferences..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                className={styles.confirmBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className={styles.spinner} />
                    <span>CONFIRMING RESERVATION...</span>
                  </>
                ) : (
                  <>
                    <span>CONFIRM RESERVATION (PAY AT PROPERTY)</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookYourStayModal;
