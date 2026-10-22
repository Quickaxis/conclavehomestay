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
  Droplet 
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { roomsData } from '../data/rooms';
import RoomCarousel from './RoomCarousel';
import ImageSlot from './ImageSlot';
import SEO from './SEO';
import NotFoundPage from './NotFoundPage';
import styles from './RoomDetailPage.module.css';
import { useBookingModal } from '../context/BookingContext';

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
  const room = roomsData.find(r => r.id === roomId);
  const otherRooms = roomsData.filter(r => r.id !== roomId);

  const pageRef = useRef(null);
  const infoRef = useRef(null);
  const { openModal } = useBookingModal();
  
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

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title={`${room.name} | The Conclave Dibrugarh`}
        description={`Explore ${room.name} at The Conclave in Khanikar, Dibrugarh. ${room.description} Indicative price range: ₹1,500–₹2,500 per room/night.`}
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
              <div className={styles.eyebrow}>ROOM TYPE: {room.category} • THE CONCLAVE</div>
              <h1 className={styles.heading}>{room.name}</h1>
              <p className={styles.description}>{room.description}</p>
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

            <div>
              <div className={styles.bookingPanel}>
                <div>
                  <div className={styles.priceLabel}>ROOM RATE</div>
                  <div className={styles.priceValue}>Rate: {room.price}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-gold)', marginTop: '4px', fontWeight: '600' }}>
                    Indicative range: ₹1,500–₹2,500 / night
                  </div>
                </div>
                <button className={styles.bookBtn} onClick={openModal}>
                  ENQUIRE ABOUT YOUR STAY <ArrowRight size={16} />
                </button>
              </div>
              <div className={styles.subNote}>Contact us to confirm room details, rates and availability.</div>
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
                  <p>Type: {otherRoom.category} • Capacity: {otherRoom.capacity}</p>
                </div>
                <div className={styles.exploreAction}>
                  <div className={styles.price}>Rate: {otherRoom.price}</div>
                  <div className={styles.viewBtn}>VIEW DETAILS &rarr;</div>
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
