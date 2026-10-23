import React, { useState } from 'react';
import { Calendar, Users, Search, RefreshCw, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import styles from './AvailabilityBar.module.css';

const AvailabilityBar = ({ onSearchComplete }) => {
  const {
    checkIn,
    setCheckIn,
    checkOut,
    setCheckOut,
    guests,
    setGuests,
    minCheckInDate,
    hmsStatus,
    verifiedHmsRooms,
    isCheckingAvailability,
    availabilityError,
    checkAvailability
  } = useBooking();

  const [dateValidationMsg, setDateValidationMsg] = useState('');

  const handleCheckInChange = (e) => {
    const newIn = e.target.value;
    setCheckIn(newIn);
    setDateValidationMsg('');
    // Auto-advance check-out if check-out <= new check-in
    if (checkOut && newIn >= checkOut) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e) => {
    const newOut = e.target.value;
    if (checkIn && newOut <= checkIn) {
      setDateValidationMsg('Check-out date must be after check-in date.');
    } else {
      setDateValidationMsg('');
    }
    setCheckOut(newOut);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) {
      setDateValidationMsg('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateValidationMsg('Check-out date must be strictly after check-in date.');
      return;
    }
    setDateValidationMsg('');
    const res = await checkAvailability(checkIn, checkOut, guests);
    if (onSearchComplete) onSearchComplete(res);
  };

  return (
    <div className={styles.barWrapper}>
      <form onSubmit={handleSearch} className={styles.barContainer}>
        {/* Check-In */}
        <div className={styles.inputSegment}>
          <label htmlFor="avail-checkin" className={styles.label}>
            <Calendar size={14} className={styles.labelIcon} /> CHECK-IN
          </label>
          <input
            id="avail-checkin"
            type="date"
            min={minCheckInDate}
            value={checkIn}
            onChange={handleCheckInChange}
            className={styles.dateInput}
            required
          />
        </div>

        <div className={styles.divider}></div>

        {/* Check-Out */}
        <div className={styles.inputSegment}>
          <label htmlFor="avail-checkout" className={styles.label}>
            <Calendar size={14} className={styles.labelIcon} /> CHECK-OUT
          </label>
          <input
            id="avail-checkout"
            type="date"
            min={checkIn || minCheckInDate}
            value={checkOut}
            onChange={handleCheckOutChange}
            className={styles.dateInput}
            required
          />
        </div>

        <div className={styles.divider}></div>

        {/* Guests */}
        <div className={styles.inputSegment}>
          <label htmlFor="avail-guests" className={styles.label}>
            <Users size={14} className={styles.labelIcon} /> GUESTS
          </label>
          <select
            id="avail-guests"
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            className={styles.selectInput}
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5 Guests</option>
            <option value={6}>6+ Guests</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className={styles.btnSegment}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isCheckingAvailability}
            aria-label="Check room availability"
          >
            {isCheckingAvailability ? (
              <>
                <RefreshCw size={16} className={styles.spinner} />
                <span>CHECKING...</span>
              </>
            ) : (
              <>
                <Search size={16} />
                <span>CHECK AVAILABILITY</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Date validation warning */}
      {dateValidationMsg && (
        <div className={styles.errorAlert}>
          <AlertCircle size={14} />
          <span>{dateValidationMsg}</span>
        </div>
      )}

      {/* Backend / HMS integration notice */}
      {availabilityError && !dateValidationMsg && (
        <div className={styles.errorAlert}>
          <AlertCircle size={14} />
          <span>
            {availabilityError.includes('No physical rooms')
              ? 'Physical rooms and approved rates are currently being configured in the HMS. Online availability search will activate once room setup is complete. You can submit a stay enquiry below.'
              : availabilityError}
          </span>
        </div>
      )}

      {/* HMS Live Integration Status Badge */}
      <div className={styles.statusFooter}>
        {verifiedHmsRooms && verifiedHmsRooms.length > 0 ? (
          <span className={styles.badgeSuccess}>
            <CheckCircle2 size={12} /> Live HMS Availability Active ({hmsStatus.homestay?.name || 'The Conclave'})
          </span>
        ) : hmsStatus.configured ? (
          <span className={styles.badgePending}>
            <Clock size={12} /> HMS Connected • Room Setup in Progress
          </span>
        ) : (
          <span className={styles.badgePending}>
            <AlertCircle size={12} /> HMS Integration Standby
          </span>
        )}
      </div>
    </div>
  );
};

export default AvailabilityBar;
