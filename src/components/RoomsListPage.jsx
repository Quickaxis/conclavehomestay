import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, Users } from 'lucide-react';
import gsap from 'gsap';
import { roomsData } from '../data/rooms';
import SEO from './SEO';
import AvailabilityBar from './AvailabilityBar';
import styles from './RoomsListPage.module.css';
import { useBooking } from '../context/BookingContext';

const RoomsListPage = () => {
  const pageRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { 
    availabilityData, 
    isCheckingAvailability, 
    availabilityError,
    verifiedHmsRooms,
    guests
  } = useBooking();

  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();
    tl.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Helper to extract normalized room digits (resolves TC-01, ROOM 01, 01 to "1")
  const getRoomDigits = (str) => {
    if (!str) return '';
    const match = String(str).match(/\d+/);
    return match ? String(parseInt(match[0], 10)) : '';
  };

  const isRoomMatch = (vr, lr) => {
    if (!vr || !lr) return false;
    if (lr.id === vr.id || lr.legacyId === vr.id) return true;
    const vrDigits = getRoomDigits(vr.roomNumber);
    if (vrDigits) {
      if (getRoomDigits(lr.detail) === vrDigits) return true;
      if (getRoomDigits(lr.legacyId) === vrDigits) return true;
      if (getRoomDigits(lr.id) === vrDigits) return true;
    }
    if (vr.name && lr.name && vr.name.trim().toLowerCase() === lr.name.trim().toLowerCase()) {
      return true;
    }
    return false;
  };

  // Map availability records by id and roomNumber
  const availabilityMap = {};
  if (availabilityData && Array.isArray(availabilityData.rooms)) {
    availabilityData.rooms.forEach(r => {
      availabilityMap[r.id] = r;
      if (r.roomNumber) {
        const num = getRoomDigits(r.roomNumber);
        const pad = num.padStart(2, '0');
        availabilityMap[`the-vista-room-${pad}`] = r;
        availabilityMap[`the-comfort-room-${pad}`] = r;
        availabilityMap[`room-${pad}`] = r;
        availabilityMap[`room-${num}`] = r;
        availabilityMap[r.roomNumber.trim()] = r;
      }
    });
  }

  // Display verified physical rooms if available from HMS, otherwise display showcase rooms
  const baseRooms = (verifiedHmsRooms && verifiedHmsRooms.length > 0)
    ? verifiedHmsRooms.map(vr => {
        const localMatch = roomsData.find(lr => isRoomMatch(vr, lr));
        return {
          id: vr.id,
          legacyId: localMatch?.legacyId || vr.id,
          name: vr.name,
          category: localMatch?.category || 'Standard Room',
          detail: vr.roomNumber ? (vr.roomNumber.toUpperCase().startsWith('ROOM') ? vr.roomNumber.toUpperCase() : `ROOM ${vr.roomNumber}`) : (localMatch?.detail || vr.name),
          description: vr.description || localMatch?.description || 'Boutique accommodation at The Conclave',
          images: localMatch?.images || ['/images/skylinesuite4.webp'],
          amenities: localMatch?.amenities || ['Attached Bathroom', 'Air Conditioning', 'Television'],
          capacity: (vr.nightlyRate === 2499 || vr.maxGuests >= 5 || localMatch?.id === 'the-grand-suite')
            ? 'Up to 5 Guests'
            : (vr.maxGuests ? `Up to ${vr.maxGuests} Guests` : (localMatch?.capacity || 'Up to 2 Guests')),
          price: vr.nightlyRate || localMatch?.price || 1499,
          nightlyRate: vr.nightlyRate
        };
      })
    : roomsData;

  const categories = [
    { label: 'All Rooms (6)', value: 'All' },
    { label: 'The Vista Room (2)', value: 'The Vista Room' },
    { label: 'The Grand Suite (1)', value: 'The Grand Suite' },
    { label: 'The Comfort Room (3)', value: 'The Comfort Room' }
  ];

  const roomsToDisplay = selectedCategory === 'All'
    ? baseRooms
    : baseRooms.filter(r => r.category === selectedCategory);

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title="Rooms & Accommodations | The Conclave Dibrugarh"
        description="Explore exactly six rooms across The Vista Rooms (₹1,999), The Grand Suite (₹2,499), and The Comfort Rooms (₹1,499) at The Conclave in Khanikar Chariali, Dibrugarh, Assam."
        path="/rooms"
      />
      <div className={styles.container}>
        
        {/* Centered Page Header (Alpine Nest Style) */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>EXACTLY SIX ROOMS</span>
          <h1 className={styles.heading}>A Comfortable Stay in Khanikar Chariali</h1>
          <p className={styles.subheading}>
            Choose from our thoughtfully designed rooms in Dibrugarh, Upper Assam, featuring air conditioning, attached bathrooms, television, and serene surroundings.
          </p>

          {/* Availability Search Bar */}
          <AvailabilityBar />

          {/* Category Filter Pills */}
          <div className={styles.filterContainer} role="tablist" aria-label="Filter rooms by category">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`${styles.filterBtn} ${selectedCategory === cat.value ? styles.filterBtnActive : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className={styles.headingLine}></div>
        </div>

        {/* Alpine Nest 2-Column Room Cards Grid */}
        <div className={styles.roomsGrid}>
          {roomsToDisplay.map((room) => {
            const liveAvail = availabilityMap[room.id] || availabilityMap[room.legacyId];
            const isAvailChecked = !!availabilityData && !isCheckingAvailability;
            const isRoomAvailable = liveAvail ? liveAvail.isAvailable : null;
            const roomRate = (liveAvail && typeof liveAvail.nightlyRate === 'number' && liveAvail.nightlyRate > 0)
              ? liveAvail.nightlyRate
              : room.price;

            // Ensure ₹2,499 room strictly displays Up to 5 Guests
            const roomCapacity = (room.id === 'the-grand-suite' || room.price === 2499)
              ? 'Up to 5 Guests'
              : (room.capacity || 'Up to 2 Guests');

            return (
              <article key={room.id} className={styles.roomCard}>

                {/* Room Image with Alpine Nest Style Overlay Badge */}
                <div className={styles.imageWrapper}>
                  <img 
                    src={room.images[0]} 
                    alt={`${room.name} at The Conclave in Dibrugarh`}
                    className={styles.roomImage}
                    loading="lazy"
                  />
                  <div className={styles.imageBadgeWrap}>
                    <span className={styles.imageCategoryBadge}>
                      {room.category}
                    </span>
                  </div>
                </div>

                {/* Room Information Area */}
                <div className={styles.cardContent}>

                  {/* Meta / Availability Row */}
                  <div className={styles.metaRow}>
                    <span className={styles.detailEyebrow}>{room.detail}</span>
                    
                    {isAvailChecked && liveAvail ? (
                      isRoomAvailable ? (
                        <span className={`${styles.availBadge} ${styles.availBadgeAvailable}`}>
                          <CheckCircle2 size={12} />
                          AVAILABLE ({availabilityData.nights}N)
                        </span>
                      ) : (
                        <span className={`${styles.availBadge} ${styles.availBadgeUnavailable}`}>
                          <XCircle size={12} />
                          {liveAvail.unavailabilityReason || 'UNAVAILABLE FOR DATES'}
                        </span>
                      )
                    ) : availabilityError ? (
                      <span className={`${styles.availBadge} ${styles.availBadgePending}`}>
                        <AlertCircle size={12} />
                        ON ENQUIRY
                      </span>
                    ) : (
                      <span className={`${styles.availBadge} ${styles.availBadgePending}`}>
                        <Clock size={12} />
                        CONFIRMED RATE
                      </span>
                    )}
                  </div>

                  {/* Room Name */}
                  <h2 className={styles.roomName}>{room.name}</h2>

                  {/* Truthful Room Description */}
                  <p className={styles.roomDesc}>
                    {liveAvail?.description || room.description}
                  </p>
                  
                  {/* Compact Amenities List */}
                  <div className={styles.amenitiesList}>
                    {room.amenities.map((amenity, idx) => (
                      <div key={idx} className={styles.amenityItem}>
                        <span className={styles.bullet}>&bull;</span> {amenity}
                      </div>
                    ))}
                  </div>

                  {/* Capacity & Price Row (Exact Alpine Nest Typography) */}
                  <div className={styles.capacityPriceRow}>
                    <div className={styles.capacityBox}>
                      <Users size={16} className={styles.capacityIcon} />
                      <span>{roomCapacity}</span>
                    </div>

                    <div className={styles.priceBox}>
                      <span className={styles.priceAmount}>₹{roomRate.toLocaleString()}/-</span>
                      <span className={styles.pricePeriod}>NIGHT</span>
                    </div>
                  </div>

                  {/* Multi-night estimate if dates selected */}
                  {availabilityData && availabilityData.nights && (
                    <div className={styles.multiNightBox}>
                      Total for {availabilityData.nights} night{availabilityData.nights > 1 ? 's' : ''} ({guests} guest{guests > 1 ? 's' : ''}): <strong>₹{(roomRate * availabilityData.nights).toLocaleString()}</strong> (Pay at Property)
                    </div>
                  )}

                  {/* Dashed Divider Line */}
                  <div className={styles.cardDivider}></div>

                  {/* Alpine Nest Single Action: Clean full-width text link at bottom */}
                  <a
                    href={`/rooms/${room.id}`}
                    className={styles.viewDetailsRow}
                  >
                    <span>VIEW DETAILS</span>
                    <span className={styles.arrowIcon}>&rarr;</span>
                  </a>

                </div>
              </article>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RoomsListPage;
