import React, { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { roomsData } from '../data/rooms';
import SEO from './SEO';
import AvailabilityBar from './AvailabilityBar';
import styles from './RoomsListPage.module.css';
import { useBooking } from '../context/BookingContext';

const RoomsListPage = () => {
  const pageRef = useRef(null);
  const { 
    openModal, 
    availabilityData, 
    isCheckingAvailability, 
    availabilityError,
    hmsStatus,
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
        availabilityMap[`room-${num.padStart(2, '0')}`] = r;
        availabilityMap[`room-${num}`] = r;
        availabilityMap[r.roomNumber.trim()] = r;
      }
    });
  }

  // Display verified physical rooms if available from HMS, otherwise display showcase rooms
  const roomsToDisplay = (verifiedHmsRooms && verifiedHmsRooms.length > 0)
    ? verifiedHmsRooms.map(vr => {
        const localMatch = roomsData.find(lr => lr.id === vr.id || lr.detail === vr.roomNumber);
        return {
          id: vr.id,
          name: vr.name,
          detail: vr.roomNumber ? `ROOM ${vr.roomNumber}` : vr.name,
          description: vr.description || localMatch?.description || 'Boutique accommodation at The Conclave',
          images: localMatch?.images || ['/images/skylinesuite4.webp'],
          amenities: localMatch?.amenities || ['Attached Bathroom', 'Air Conditioning', 'WiFi'],
          nightlyRate: vr.nightlyRate
        };
      })
    : roomsData;

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title="Rooms & Accommodations | The Conclave Dibrugarh"
        description="Explore the accommodations at The Conclave in Khanikar, Dibrugarh, Assam. Live availability and pay-at-property reservations powered by our Hotel Management System."
        path="/rooms"
      />
      <div className={styles.container}>
        
        <div className={styles.header}>
          <span className={styles.eyebrow}>ACCOMMODATIONS</span>
          <h1 className={styles.heading}>FIND YOUR SPACE.</h1>
          <p className={styles.subheading}>
            Select your dates below to verify real-time room availability and approved rates directly from our Hotel Management System.
          </p>

          {/* Availability Search Bar */}
          <AvailabilityBar />

          <div className={styles.headingLine}></div>
        </div>

        <div className={styles.roomsGrid}>
          {roomsToDisplay.map((room) => {
            const liveAvail = availabilityMap[room.id];
            const isAvailChecked = !!availabilityData && !isCheckingAvailability;
            const isRoomAvailable = liveAvail ? liveAvail.isAvailable : null;

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
                    <span className={styles.categoryBadge}>{room.name}</span>
                    
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
                    ) : hmsStatus.configured ? (
                      <span className={styles.availBadge}>SELECT DATES TO CHECK</span>
                    ) : (
                      <span className={`${styles.availBadge} ${styles.availBadgePending}`}>
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
                    {liveAvail && typeof liveAvail.nightlyRate === 'number' && liveAvail.nightlyRate > 0 ? (
                      <div>
                        <div className={styles.price}>
                          ₹{liveAvail.nightlyRate.toLocaleString()}
                        </div>
                        <div className={styles.nightText}>
                          APPROVED NIGHTLY RATE
                        </div>
                        {liveAvail.totalPrice && (
                          <div className={styles.totalPriceText}>
                            Total for {availabilityData.nights} night{availabilityData.nights > 1 ? 's' : ''} ({guests} guest{guests > 1 ? 's' : ''}): ₹{liveAvail.totalPrice.toLocaleString()} (Pay at Property)
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className={styles.price}>Rate on Enquiry</div>
                        <div className={styles.nightText}>
                          APPROVED NIGHTLY RATES PUBLISHED UPON ROOM SETUP
                        </div>
                      </div>
                    )}
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
