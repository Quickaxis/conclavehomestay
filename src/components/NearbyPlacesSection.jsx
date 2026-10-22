import React from 'react';
import { nearbyPlacesData } from '../data/nearbyPlaces';
import ImageSlot from './ImageSlot';
import styles from './NearbyPlacesSection.module.css';

const themeClasses = [
  styles.themeBurgundy,
  styles.themeCharcoal,
  styles.themeGold,
  styles.themeWarmBurgundy,
  styles.themeDeepEarth
];

const staticRotations = [-2.5, 2, -2, 2.5, -1.5, 2];

const DecorativePath = () => (
  <svg 
    className={styles.cardDecoration} 
    viewBox="0 0 100 40" 
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <path 
      d="M0,20 Q25,40 50,20 T100,20" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeDasharray="4 4"
    />
  </svg>
);

const FloatingPlaceCard = ({ place, index }) => {
  const staticRotation = staticRotations[index % staticRotations.length];
  const themeClass = themeClasses[index % themeClasses.length];

  return (
    <div className={styles.cardContainer}>
      <div 
        className={styles.photoPrint}
        style={{ '--card-rot': `${staticRotation}deg` }}
      >
        <div className={styles.imageFrame}>
          <ImageSlot
            id={place.imageSlot}
            src={place.src}
            alt={place.alt}
            aspectRatio="3/4"
            overlay={false}
          />
        </div>
      </div>
      <div className={`${styles.coloredCard} ${themeClass}`}>
        <DecorativePath />
        <div className={styles.cardContent}>
          <h3 className={styles.placeName}>{place.name}</h3>
          <p className={styles.placeDesc}>{place.description}</p>
          <a href="/nearby-places" className={styles.exploreBtn}>
            EXPLORE &rarr;
          </a>
        </div>
      </div>
    </div>
  );
};

const NearbyPlacesSection = () => {
  return (
    <section id="nearby" className={styles.section} aria-label="Nearby Places in Dibrugarh">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.eyebrow}>REGIONAL HIGHLIGHTS</span>
          <h2 className={styles.heading}>NEARBY PLACES</h2>
        </div>
        <div className={styles.headerRight}>
          Discover scenic landmarks, heritage tea trails, and river vistas across Upper Assam within comfortable reach of The Conclave.
        </div>
      </div>
      
      <div className={styles.carouselViewport}>
        <div className={styles.carouselTrack}>
          {/* Set 1 */}
          <div className={styles.carouselSet}>
            {nearbyPlacesData.map((place, idx) => (
              <FloatingPlaceCard key={place.id} place={place} index={idx} />
            ))}
          </div>
          {/* Set 2 (Duplicate for seamless loop) */}
          <div className={styles.carouselSet}>
            {nearbyPlacesData.map((place, idx) => (
              <FloatingPlaceCard key={`${place.id}-dup`} place={place} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NearbyPlacesSection;
