import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { roomsData } from '../data/rooms';
import SEO from './SEO';
import styles from './RoomsListPage.module.css';
import { useBookingModal } from '../context/BookingContext';

const RoomsListPage = () => {
  const pageRef = useRef(null);
  const { openModal } = useBookingModal();

  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();
    tl.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title="Rooms & Accommodations | The Conclave Dibrugarh"
        description="Explore the six rooms at The Conclave in Khanikar, Dibrugarh, Assam. Thoughtfully designed accommodations for families, business travellers and Upper Assam exploration."
        path="/rooms"
      />
      <div className={styles.container}>
        
        <div className={styles.header}>
          <span className={styles.eyebrow}>ACCOMMODATIONS</span>
          <h1 className={styles.heading}>FIND YOUR SPACE.</h1>
          <p className={styles.subheading}>
            Explore our six rooms and choose the one that suits your stay. Contact us to confirm room details, rates and availability.
          </p>
          <div style={{
            display: 'inline-block',
            background: 'var(--color-cream)',
            border: '1px solid var(--color-gold)',
            padding: '8px 20px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--color-burgundy)',
            letterSpacing: '0.05em',
            marginBottom: '18px'
          }}>
            INDICATIVE PRICE RANGE: ₹1,500–₹2,500 PER ROOM/NIGHT
          </div>
          <div className={styles.headingLine}></div>
        </div>

        <div className={styles.roomsGrid}>
          {roomsData.map((room) => {
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
                    <span className={styles.categoryBadge}>ROOM TYPE: {room.category}</span>
                    <span className={styles.availBadge}>{room.detail}</span>
                  </div>
                  <h3 className={styles.roomName}>{room.name}</h3>
                  <p className={styles.roomDesc}>{room.description}</p>
                  
                  <div className={styles.priceContainer}>
                    <div className={styles.price}>Rate: {room.price}</div>
                    <div className={styles.nightText}>PER ROOM / NIGHT (INDICATIVE: ₹1,500–₹2,500)</div>
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
                    <a href={`/rooms/${room.id}`} className={styles.viewBtn}>VIEW DETAILS</a>
                    <button onClick={openModal} className={styles.bookBtn}>ENQUIRE NOW</button>
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
