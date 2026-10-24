import React, { useEffect, useRef } from 'react';
import { 
  Snowflake, 
  ShowerHead, 
  Tv, 
  Home,
  Users,
  Armchair,
  Wifi,
  Car,
  Droplet,
  Flame
} from 'lucide-react';
import gsap from 'gsap';
import { roomsData } from '../data/rooms';
import RoomCarousel from './RoomCarousel';
import SEO from './SEO';
import NotFoundPage from './NotFoundPage';
import styles from './RoomDetailPage.module.css';
import { useBooking } from '../context/BookingContext';

const getAmenityIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes('air') || lower.includes('ac')) return <Snowflake className={styles.amenityIcon} />;
  if (lower.includes('bath') || lower.includes('shower')) return <ShowerHead className={styles.amenityIcon} />;
  if (lower.includes('tv') || lower.includes('television')) return <Tv className={styles.amenityIcon} />;
  if (lower.includes('wifi') || lower.includes('wi-fi')) return <Wifi className={styles.amenityIcon} />;
  if (lower.includes('parking') || lower.includes('car')) return <Car className={styles.amenityIcon} />;
  if (lower.includes('purifier') || lower.includes('water purifier')) return <Droplet className={styles.amenityIcon} />;
  if (lower.includes('geyser') || lower.includes('hot water')) return <Flame className={styles.amenityIcon} />;
  if (lower.includes('sofa')) return <Armchair className={styles.amenityIcon} />;
  if (lower.includes('balcony')) return <Home className={styles.amenityIcon} />;
  return <Home className={styles.amenityIcon} />;
};

const RoomDetailPage = ({ roomId }) => {
  const pageRef = useRef(null);
  const infoRef = useRef(null);
  const { 
    openModal, 
    availabilityData,
    verifiedHmsRooms,
    isLoadingStatus
  } = useBooking();

  // Helper to match an HMS room with a static room record
  const isRoomMatch = (hmsRoom, staticRoom) => {
    if (!hmsRoom || !staticRoom) return false;
    if (hmsRoom.id === staticRoom.id || hmsRoom.id === staticRoom.legacyId) return true;
    if (hmsRoom.roomNumber) {
      const rawNum = String(hmsRoom.roomNumber).trim();
      const numOnly = rawNum.replace(/^room\s*/i, '').replace(/^0+/, '');
      const padNum = numOnly.padStart(2, '0');
      if (staticRoom.detail && (staticRoom.detail.toUpperCase() === `ROOM ${padNum}` || staticRoom.detail.toUpperCase() === `ROOM ${rawNum.toUpperCase()}`)) return true;
      if (staticRoom.legacyId === `room-${padNum}` || staticRoom.legacyId === `room-${numOnly}`) return true;
      if (staticRoom.id === `the-vista-room-${padNum}` || staticRoom.id === `the-comfort-room-${padNum}`) return true;
      if (staticRoom.id === 'the-grand-suite' && (numOnly === '3' || padNum === '03' || rawNum === '03' || rawNum === '3')) return true;
    }
    if (hmsRoom.name && staticRoom.name) {
      const hmsName = hmsRoom.name.trim().toLowerCase();
      const staticName = staticRoom.name.trim().toLowerCase();
      if (hmsName === staticName || hmsName.includes(staticName) || staticName.includes(hmsName)) return true;
    }
    return false;
  };

  // 1. Check if roomId matches a static room definition (by slug/id or legacyId)
  const staticRoomMatch = roomsData.find(r => r.id === roomId || r.legacyId === roomId);

  // 2. Check if roomId matches an actual verified HMS room UUID
  const liveVerifiedRoom = Array.isArray(verifiedHmsRooms)
    ? (verifiedHmsRooms.find(vr => vr.id === roomId) || (staticRoomMatch ? verifiedHmsRooms.find(vr => isRoomMatch(vr, staticRoomMatch)) : null))
    : null;

  // 3. Check if roomId matches a room in availabilityData
  const liveAvailRoom = (availabilityData && Array.isArray(availabilityData.rooms))
    ? (availabilityData.rooms.find(ar => ar.id === roomId) || (staticRoomMatch ? availabilityData.rooms.find(ar => isRoomMatch(ar, staticRoomMatch)) : null))
    : null;

  const liveHms = liveVerifiedRoom || liveAvailRoom;

  // 4. Resolve the base presentation template from static roomsData
  const baseStatic = staticRoomMatch || (liveHms ? (roomsData.find(sr => isRoomMatch(liveHms, sr)) || roomsData[0]) : null);

  // 5. Construct unified room object
  const room = baseStatic ? {
    ...baseStatic,
    id: liveHms ? liveHms.id : baseStatic.id,
    slug: baseStatic.id,
    legacyId: baseStatic.legacyId,
    name: (liveHms && liveHms.name) ? liveHms.name : baseStatic.name,
    category: baseStatic.category,
    detail: (liveHms && liveHms.roomNumber)
      ? (String(liveHms.roomNumber).toUpperCase().startsWith('ROOM')
          ? String(liveHms.roomNumber).toUpperCase()
          : `ROOM ${String(liveHms.roomNumber).replace(/^room\s*/i, '').replace(/^0+/, '').padStart(2, '0')}`)
      : baseStatic.detail,
    description: (liveHms && liveHms.description) ? liveHms.description : baseStatic.description,
    price: (liveHms && typeof liveHms.nightlyRate === 'number' && liveHms.nightlyRate > 0)
      ? liveHms.nightlyRate
      : baseStatic.price,
    priceDisplay: (liveHms && typeof liveHms.nightlyRate === 'number' && liveHms.nightlyRate > 0)
      ? `₹${liveHms.nightlyRate.toLocaleString()}`
      : baseStatic.priceDisplay,
    capacity: (baseStatic.id === 'the-grand-suite' || baseStatic.legacyId === 'room-03' || (liveHms && (liveHms.nightlyRate === 2499 || liveHms.maxGuests >= 5)))
      ? 'Up to 5 Guests'
      : ((liveHms && liveHms.maxGuests) ? `Up to ${liveHms.maxGuests} Guests` : (baseStatic.capacity || 'Up to 2 Guests')),
    amenities: baseStatic.amenities || [],
    images: baseStatic.images || ['/images/skylinesuite4.webp']
  } : null;

  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();
    
    if (pageRef.current) {
      tl.fromTo(pageRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
    
    if (infoRef.current) {
      tl.fromTo(infoRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" },
        "-=0.2"
      );
    }
  }, [roomId, Boolean(room)]);

  // If room is not yet resolved:
  // If status is still loading from server (e.g. initial load of direct UUID link), display loading state
  if (!room) {
    if (isLoadingStatus) {
      return (
        <div className={styles.pageWrapper}>
          <div className={styles.container} style={{ textAlign: 'center', padding: '120px 24px', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontFamily: 'var(--font-primary)', color: 'var(--color-gold)', fontSize: '16px', letterSpacing: '0.05em', fontWeight: 600 }}>
              Loading room details...
            </p>
          </div>
        </div>
      );
    }
    return <NotFoundPage />;
  }

  // Match room in date-specific live availability data
  let liveAvail = null;
  if (availabilityData && Array.isArray(availabilityData.rooms)) {
    liveAvail = availabilityData.rooms.find(r => {
      if (r.id === roomId || (liveHms && r.id === liveHms.id)) return true;
      if (baseStatic && (r.id === baseStatic.id || r.id === baseStatic.legacyId)) return true;
      if (r.roomNumber && baseStatic) {
        return isRoomMatch(r, baseStatic);
      }
      return false;
    });
  }

  const roomRate = (liveAvail && typeof liveAvail.nightlyRate === 'number' && liveAvail.nightlyRate > 0)
    ? liveAvail.nightlyRate
    : ((liveHms && typeof liveHms.nightlyRate === 'number' && liveHms.nightlyRate > 0)
        ? liveHms.nightlyRate
        : room.price);

  // Enforce: The room priced at ₹2,499 per night must display Up to 5 Guests
  const roomCapacity = (room.id === 'the-grand-suite' || room.legacyId === 'room-03' || roomRate === 2499 || room.price === 2499)
    ? 'Up to 5 Guests'
    : (room.capacity || 'Up to 2 Guests');

  // Comprehensive 2-column amenities list including verified in-room & property-wide amenities
  const detailedAmenities = [
    ...room.amenities,
    "High-Speed Wi-Fi",
    "Free Parking",
    "Geyser / Hot Water",
    "Water Purifier"
  ];

  return (
    <div className={styles.pageWrapper} ref={pageRef}>
      <SEO 
        title={`${room.name} (${roomRate ? `₹${roomRate.toLocaleString()}` : room.priceDisplay}/night) | The Conclave Dibrugarh`}
        description={`${room.name} at The Conclave in Khanikar Chariali, Dibrugarh, Assam. ${room.description}`}
        path={`/rooms/${roomId || room.id}`}
        ogImage={room.images[0]}
      />

      <div className={styles.container}>
        
        {/* Breadcrumb Navigation: Home → Rooms → Room Name */}
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <a href="/">Home</a>
          <span className={styles.crumbArrow}>&rarr;</span>
          <a href="/rooms">Rooms</a>
          <span className={styles.crumbArrow}>&rarr;</span>
          <span className={styles.activeCrumb}>{room.name}</span>
        </nav>

        {/* Alpine Nest 2-Column Detail Layout */}
        <div className={styles.grid}>
          
          {/* Left Column: Room Image Gallery with Thumbnails & Controls */}
          <div className={styles.galleryCol}>
            <RoomCarousel roomId={baseStatic.id} images={room.images} />
          </div>

          {/* Right Column: Room Details & Booking Panel */}
          <div className={styles.contentCol} ref={infoRef}>

            {/* Category / Unit Tag */}
            <div className={styles.headerMeta}>
              <span className={styles.categoryBadge}>
                {room.category.toUpperCase()} • {room.detail}
              </span>
            </div>

            {/* Room Title */}
            <h1 className={styles.heading}>{room.name}</h1>

            {/* Truthful Room Description */}
            <p className={styles.description}>
              {liveAvail?.description || room.description}
            </p>

            {/* Guest Capacity */}
            <div className={styles.capacityMeta}>
              <Users size={16} className={styles.capacityIcon} />
              <span>{roomCapacity}</span>
            </div>

            {/* Room Amenities Section (2-Column Layout with Icons) */}
            <div className={styles.amenitiesSection}>
              <h2 className={styles.sectionTitle}>Room Amenities</h2>
              <div className={styles.amenitiesGrid}>
                {detailedAmenities.map((amenityName, idx) => (
                  <div key={idx} className={styles.amenityItem}>
                    {getAmenityIcon(amenityName)}
                    <span>{amenityName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Alpine Nest Style Price Panel with Prominent BOOK YOUR STAY → Button */}
            <div className={styles.bookingPanelContainer}>
              <div className={styles.pricePanel}>
                <div className={styles.priceInfo}>
                  <span className={styles.priceLabel}>PRICE PER NIGHT</span>
                  <div className={styles.priceValue}>
                    ₹{roomRate.toLocaleString()}/-
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.bookYourStayBtn}
                  onClick={() => openModal({ roomId: liveHms?.id || room.id, mode: 'book' })}
                >
                  <span>BOOK YOUR STAY</span>
                  <span className={styles.btnArrow}>&rarr;</span>
                </button>
              </div>

              {/* Subtext below panel */}
              <p className={styles.welcomeSubtext}>
                Couples, Families &amp; Business Travellers Welcome
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default RoomDetailPage;
