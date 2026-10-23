import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
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
    openModal, 
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

  // Map availability records by id and roomNumber
  const availabilityMap = {};
  if (availabilityData && Array.isArray(availabilityData.rooms)) {
    availabilityData.rooms.forEach(r => {
      availabilityMap[r.id] = r;
      if (r.roomNumber) {
        const num = r.roomNumber.trim().replace(/^0+/, '');
        availabilityMap[`the-vista-room-${num.padStart(2, '0')}`] = r;
        availabilityMap[`the-comfort-room-${num.padStart(2, '0')}`] = r;
        availabilityMap[`room-${num.padStart(2, '0')}`] = r;
        availabilityMap[`room-${num}`] = r;
        availabilityMap[r.roomNumber.trim()] = r;
      }
    });
  }

  // Display verified physical rooms if available from HMS, otherwise display showcase rooms
  const baseRooms = (verifiedHmsRooms && verifiedHmsRooms.length > 0)
    ? verifiedHmsRooms.map(vr => {
        const localMatch = roomsData.find(lr => lr.id === vr.id || lr.legacyId === vr.id || lr.detail === vr.roomNumber);
        return {
          id: vr.id,
          name: vr.name,
          category: localMatch?.category || 'Standard Room',
          detail: vr.roomNumber ? `ROOM ${vr.roomNumber}` : (localMatch?.detail || vr.name),
          description: vr.description || localMatch?.description || 'Boutique accommodation at The Conclave',
          images: localMatch?.images || ['/images/skylinesuite4.webp'],
          amenities: localMatch?.amenities || ['Attached Bathroom', 'Air Conditioning', 'Television'],
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
        
        <div className={styles.header}>
          <span className={styles.eyebrow}>EXACTLY SIX ROOMS</span>
          <h1 className={styles.heading}>FIND YOUR SPACE.</h1>
          <p className={styles.subheading}>
            Select your dates below to verify real-time room availability and approved rates directly from our Hotel Management System.
          </p>

          {/* Availability Search Bar */}
          <AvailabilityBar />

          {/* Category Filter Tabs */}
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

        <div className={styles.roomsGrid}>
          {roomsToDisplay.map((room) => {
            const liveAvail = availabilityMap[room.id] || availabilityMap[room.legacyId];
            const isAvailChecked = !!availabilityData && !isCheckingAvailability;
            const isRoomAvailable = liveAvail ? liveAvail.isAvailable : null;
            const roomRate = (liveAvail && typeof liveAvail.nightlyRate === 'number' && liveAvail.nightlyRate > 0)
              ? liveAvail.nightlyRate
              : room.price;

            return (
              <div key={room.id} className={styles.roomCard}>
                <div className={styles.imageWrapper}>
                  <img 
                    src={room.images[0]} 
                    alt={`${room.name} at The Conclave in Dibrugarh`}
                    className={styles.roomImage}
                  />
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.badgeRow}>
                    <span className={styles.categoryBadge}>{room.category || room.name}</span>
                    
                    {/* Live Availability Badge */}
                    {isAvailChecked && liveAvail ? (
                      isRoomAvailable ? (
                        <span className={`${styles.availBadge} ${styles.availBadgeAvailable}`}>
                          <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                          AVAILABLE FOR {availabilityData.nights} NIGHT{availabilityData.nights > 1 ? 'S' : ''}
                        </span>
                      ) : (
                        <span className={`${styles.availBadge} ${styles.availBadgeUnavailable}`}>
                          <XCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                          {liveAvail.unavailabilityReason || 'UNAVAILABLE FOR SELECTED DATES'}
                        </span>
                      )
                    ) : availabilityError ? (
                      <span className={`${styles.availBadge} ${styles.availBadgePending}`}>
                        <AlertCircle size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                        AVAILABILITY ON ENQUIRY
                      </span>
                    ) : (
                      <span className={`${styles.availBadge} ${styles.availBadgePending}`}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                        HOST CONFIRMATION REQUIRED
                      </span>
                    )}
                  </div>

                  <h3 className={styles.roomName}>{room.name}</h3>
                  <p className={styles.roomDesc}>
                    {liveAvail?.description || room.description}
                  </p>
                  
                  {/* Pricing Container */}
                  <div className={styles.priceContainer}>
                    <div>
                      <div className={styles.price}>
                        ₹{roomRate.toLocaleString()}
                      </div>
                      <div className={styles.nightText}>
                        PER ROOM PER NIGHT
                      </div>
                      {availabilityData && availabilityData.nights && (
                        <div className={styles.totalPriceText}>
                          Total for {availabilityData.nights} night{availabilityData.nights > 1 ? 's' : ''} ({guests} guest{guests > 1 ? 's' : ''}): ₹{(roomRate * availabilityData.nights).toLocaleString()} (Pay at Property)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.divider}></div>

                  <div className={styles.amenitiesList}>
                    {room.amenities.map((amenity, idx) => (
                      <div key={idx} className={styles.amenityItem}>
                        <span className={styles.bullet}>&bull;</span> {amenity}
                      </div>
                    ))}
                  </div>
                  
                  <div className={styles.actions}>
                    <a href={`/rooms/${room.id}`} className={styles.viewBtn}>
                      VIEW DETAILS
                    </a>

                    {isAvailChecked && liveAvail && !isRoomAvailable ? (
                      <button 
                        disabled 
                        className={`${styles.bookBtn} ${styles.disabledBtn}`}
                        title="Room is already reserved or capacity exceeded for selected dates"
                      >
                        UNAVAILABLE
                      </button>
                    ) : isAvailChecked && liveAvail && isRoomAvailable ? (
                      <button 
                        onClick={() => openModal({ roomId: liveAvail.id, mode: 'book' })} 
                        className={styles.bookBtn}
                      >
                        RESERVE (PAY AT PROPERTY)
                      </button>
                    ) : (
                      <button 
                        onClick={() => openModal({ roomId: room.id, mode: 'enquiry' })} 
                        className={styles.bookBtn}
                      >
                        ENQUIRE ABOUT STAY
                      </button>
                    )}

                    <button
                      onClick={() => openModal({ roomId: room.id, mode: 'enquiry' })}
                      className={styles.viewBtn}
                      style={{ fontSize: '11px', padding: '10px 16px' }}
                      title="General questions without blocking inventory"
                    >
                      ENQUIRE
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default RoomsListPage;
