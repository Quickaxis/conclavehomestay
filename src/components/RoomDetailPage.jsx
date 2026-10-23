import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Snowflake, 
  ShowerHead, 
  Wifi, 
  Car, 
  Utensils, 
  Tv, 
  Briefcase, 
  Bed, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Droplet,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { roomsData } from '../data/rooms';
import RoomCarousel from './RoomCarousel';
import ImageSlot from './ImageSlot';
import SEO from './SEO';
import NotFoundPage from './NotFoundPage';
import styles from './RoomDetailPage.module.css';
import { useBooking } from '../context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

const getAmenityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('air') || lower.includes('ac')) return <Snowflake className={styles.amenityIcon} />;
  if (lower.includes('wifi')) return <Wifi className={styles.amenityIcon} />;
  if (lower.includes('kitchen')) return <Utensils className={styles.amenityIcon} />;
  if (lower.includes('parking')) return <Car className={styles.amenityIcon} />;
  if (lower.includes('bath') || lower.includes('shower')) return <ShowerHead className={styles.amenityIcon} />;
  if (lower.includes('tv')) return <Tv className={styles.amenityIcon} />;
  if (lower.includes('work') || lower.includes('desk')) return <Briefcase className={styles.amenityIcon} />;
  if (lower.includes('bed') || lower.includes('linen')) return <Bed className={styles.amenityIcon} />;
  if (lower.includes('clean') || lower.includes('housekeeping')) return <Sparkles className={styles.amenityIcon} />;
  if (lower.includes('water')) return <Droplet className={styles.amenityIcon} />;
  if (lower.includes('check') || lower.includes('time')) return <Clock className={styles.amenityIcon} />;
  return <ShieldCheck className={styles.amenityIcon} />;
};

const RoomDetailPage = ({ roomId }) => {
  const room = roomsData.find(r => r.id === roomId || r.legacyId === roomId);
  const otherRooms = roomsData.filter(r => r.id !== room?.id);

  const pageRef = useRef(null);
  const infoRef = useRef(null);
  const { 
    openModal, 
    availabilityData, 
    checkIn, 
    checkOut, 
    guests 
  } = useBooking();
  
  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();
    
    tl.fromTo(pageRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );
    
    if (infoRef.current) {
      tl.fromTo(infoRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, [roomId]);

  if (!room) return <NotFoundPage />;

  // Match room in live availability data
  let liveAvail = null;
  if (availabilityData && Array.isArray(availabilityData.rooms)) {
    liveAvail = availabilityData.rooms.find(r => {
      if (r.id === room.id || r.id === room.legacyId) return true;
      if (r.roomNumber) {
        const num = r.roomNumber.trim().replace(/^0+/, '');
        return room.id === `the-vista-room-${num.padStart(2, '0')}` ||
               room.id === `the-comfort-room-${num.padStart(2, '0')}` ||
               room.legacyId === `room-${num.padStart(2, '0')}` ||
               room.legacyId === `room-${num}`;
      }
      return false;
    });
  }

  const isAvailable = liveAvail ? liveAvail.isAvailable : null;
  const roomRate = (liveAvail && typeof liveAvail.nightlyRate === 'number' && liveAvail.nightlyRate > 0)
    ? liveAvail.nightlyRate
    : room.price;
  const nights = availabilityData?.nights || 1;
  const totalEstimate = roomRate * nights;

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title={`${room.name} (${room.priceDisplay}/night) | The Conclave Dibrugarh`}
        description={`${room.name} at The Conclave in Khanikar Chariali, Dibrugarh, Assam. ${room.description}`}
        path={`/rooms/${room.id}`}
        ogImage={room.images[0]}
      />
      {/* Subtle dashed route curve in background */}
      <svg className={styles.bgCurve} viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path 
          d="M-100,50 C 300,150 600,0 900,100 C 1200,200 1500,50 1800,100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeDasharray="6 6"
        />
      </svg>

      <div className={styles.container}>
        
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <a href="/">Home</a> &gt; <a href="/rooms">Rooms</a> &gt; <span>{room.name}</span>
        </div>

        {/* Main Grid */}
        <div className={styles.grid}>
          
          {/* Left: Carousel */}
          <div>
            <RoomCarousel roomId={room.id} images={room.images} />
          </div>

          {/* Right: Info */}
          <div className={styles.contentCol} ref={infoRef}>
            <div>
              <div className={styles.eyebrow}>
                {room.category.toUpperCase()} • THE CONCLAVE
              </div>
              <h1 className={styles.heading}>{room.name}</h1>
              <p className={styles.description}>
                {liveAvail?.description || room.description}
              </p>
            </div>

            <div>
              <h3 className={styles.sectionTitle}>Room Features & Amenities</h3>
              <div className={styles.amenitiesGrid}>
                {room.amenities.map((amenityName, idx) => (
                  <div key={idx} className={styles.amenityItem}>
                    {getAmenityIcon(amenityName)}
                    <span>{amenityName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Booking & Pricing Panel */}
            <div>
              <div className={styles.bookingPanel}>
                <div>
                  <div className={styles.priceLabel}>NIGHTLY ROOM RATE</div>
                  <div>
                    <div className={styles.priceValue}>
                      ₹{roomRate.toLocaleString()} <span style={{ fontSize: '13px', fontWeight: 500, color: 'inherit' }}>/ night (per room)</span>
                    </div>
                    {availabilityData && availabilityData.nights && (
                      <div style={{ fontSize: '12px', color: 'var(--color-gold)', marginTop: '4px', fontWeight: '600' }}>
                        Total for {availabilityData.nights} night{availabilityData.nights > 1 ? 's' : ''} ({guests} guest{guests > 1 ? 's' : ''}): ₹{totalEstimate.toLocaleString()} (Pay at Property)
                      </div>
                    )}
                  </div>
                </div>

                {/* Status-Aware Action Button */}
                {liveAvail && !isAvailable ? (
                  <button 
                    disabled 
                    className={styles.bookBtn}
                    style={{ background: '#CBD5E0', borderColor: '#CBD5E0', cursor: 'not-allowed', color: '#718096' }}
                  >
                    <XCircle size={16} /> UNAVAILABLE FOR DATES
                  </button>
                ) : liveAvail && isAvailable ? (
                  <button 
                    className={styles.bookBtn} 
                    onClick={() => openModal({ roomId: room.id, mode: 'book' })}
                  >
                    RESERVE (PAY AT PROPERTY) <ArrowRight size={16} />
                  </button>
                ) : (
                  <button 
                    className={styles.bookBtn} 
                    onClick={() => openModal({ roomId: room.id, mode: 'enquiry' })}
                  >
                    ENQUIRE ABOUT STAY <ArrowRight size={16} />
                  </button>
                )}
              </div>

              {/* Status Note */}
              <div className={styles.subNote}>
                {liveAvail ? (
                  isAvailable ? (
                    <span style={{ color: '#2F855A', fontWeight: 600 }}>
                      <CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                      Available for {checkIn} &rarr; {checkOut} ({guests} guest{guests > 1 ? 's' : ''})
                    </span>
                  ) : (
                    <span style={{ color: '#C53030', fontWeight: 600 }}>
                      <AlertCircle size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                      {liveAvail.unavailabilityReason || 'Unavailable for selected dates'}
                    </span>
                  )
                ) : (
                  <span>Selected dates: {checkIn} to {checkOut}. Pay upon arrival directly at property. Enquiries require host confirmation before reservation is finalized.</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Explore Other Rooms Section */}
        <div className={styles.exploreSection}>
          <div className={styles.exploreSectionTitle}>
            <div className={styles.eyebrow}>DISCOVER MORE</div>
            <h2 className={styles.heading} style={{ textAlign: 'center', fontSize: '32px' }}>EXPLORE OUR SIX ROOMS</h2>
          </div>
          
          <div className={styles.exploreGrid}>
            {otherRooms.map(otherRoom => (
              <a key={otherRoom.id} href={`/rooms/${otherRoom.id}`} className={styles.exploreCard}>
                <div className={styles.exploreImage}>
                  <ImageSlot 
                    id={otherRoom.images[0]} 
                    src={otherRoom.images[0]}
                    alt={`${otherRoom.name} at The Conclave in Dibrugarh`}
                    aspectRatio="16/10"
                    overlay={false}
                  />
                </div>
                <div className={styles.exploreInfo}>
                  <h4>{otherRoom.name}</h4>
                  <p>{otherRoom.category} • Khanikar Chariali</p>
                </div>
                <div className={styles.exploreAction}>
                  <div className={styles.price}>₹{otherRoom.price.toLocaleString()} / night</div>
                  <div className={styles.viewBtn}>DETAILS &rarr;</div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDetailPage;
