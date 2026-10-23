import React, { useEffect, useRef } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { roomsData } from '../data/rooms';
import ImageSlot from './ImageSlot';
import styles from './RoomSection.module.css';
import { useBooking } from '../context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

const RoomCard = ({ room, verifiedRoom }) => {
  const effectiveRate = (verifiedRoom && typeof verifiedRoom.nightlyRate === 'number' && verifiedRoom.nightlyRate > 0)
    ? verifiedRoom.nightlyRate
    : room.price;

  return (
    <a 
      href={`/rooms/${room.id}`} 
      className={styles.card} 
      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      aria-label={`View details for ${room.name}`}
    >
      <div className={styles.imageWrapper}>
        <ImageSlot
          id={room.id}
          src={room.src}
          alt={room.alt}
          aspectRatio={room.aspectRatio}
          overlay={false}
          className={styles.cardImageSlot}
        />
        <div className={styles.imageOverlay}></div>
      </div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          {room.category && <span className={styles.detailPill}>{room.category.toUpperCase()}</span>}
          <span className={styles.pricePill} style={{ borderColor: 'var(--color-gold)', color: 'var(--color-burgundy)', fontWeight: '700' }}>
            ₹{effectiveRate.toLocaleString()} / NIGHT
          </span>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.cardMeta}>
            <h3 className={styles.roomName}>{room.name}</h3>
            <p className={styles.roomDesc}>{verifiedRoom?.description || room.description}</p>
          </div>
          <div className={styles.arrowBtn} aria-label={`View ${room.name}`}>
            <ArrowRight size={20} />
          </div>
        </div>
      </div>
    </a>
  );
};

const RoomSection = () => {
  const sectionRef = useRef(null);
  const eyebrowRef = useRef(null);
  const headingLinesRef = useRef([]);
  const ctaRef = useRef(null);
  const { verifiedHmsRooms } = useBooking();

  // Create room map for fast lookup
  const verifiedMap = {};
  if (Array.isArray(verifiedHmsRooms)) {
    verifiedHmsRooms.forEach(vr => {
      verifiedMap[vr.id] = vr;
      if (vr.roomNumber) {
        const num = vr.roomNumber.trim().replace(/^0+/, '');
        verifiedMap[`room-${num.padStart(2, '0')}`] = vr;
        verifiedMap[`room-${num}`] = vr;
      }
    });
  }

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none"
        }
      });

      // Eyebrow
      tl.fromTo(eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );

      // Heading line-by-line reveal
      tl.fromTo(headingLinesRef.current,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" },
        "-=0.6"
      );

      // Bottom CTA
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        );
      }

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="rooms" className={styles.section} ref={sectionRef}>
      <div className={styles.decorativeWord}>CONCLAVE</div>
      <div className="section-container">
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow} ref={eyebrowRef}>ACCOMMODATIONS</span>
            <h2 className={styles.heading}>
              <span className={styles.headingLine} ref={el => headingLinesRef.current[0] = el}>FIND YOUR</span>
              <span className={styles.headingLine} ref={el => headingLinesRef.current[1] = el}>SPACE.</span>
            </h2>
          </div>
        </div>
      </div>
        
      {/* Viewport for continuous horizontal marquee */}
      <div className={styles.carouselViewport}>
        <div className={styles.carouselTrack}>
          {/* Set 1 */}
          <div className={styles.carouselSet}>
            {roomsData.map((room) => (
              <RoomCard 
                key={`set1-${room.id}`} 
                room={room} 
                verifiedRoom={verifiedMap[room.id]}
              />
            ))}
          </div>
          {/* Set 2 (Duplicate for seamless loop) */}
          <div className={`${styles.carouselSet} ${styles.duplicateSet}`}>
            {roomsData.map((room) => (
              <RoomCard 
                key={`set2-${room.id}`} 
                room={room} 
                verifiedRoom={verifiedMap[room.id]}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="section-container">
        <div className={styles.bottomCtaContainer} ref={ctaRef}>
          <a href="/rooms" className={styles.viewOurRoomsBtn} style={{ textDecoration: 'none', display: 'inline-flex' }}>
            EXPLORE OUR SIX ROOMS
            <div className={styles.ctaCircle}>
              <ArrowUpRight size={20} strokeWidth={2.5} />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default RoomSection;
