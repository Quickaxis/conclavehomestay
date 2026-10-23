import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowUpRight } from 'lucide-react';
import { nearbyPlacesData } from '../data/nearbyPlaces';
import ImageSlot from './ImageSlot';
import SEO from './SEO';
import styles from './NearbyPlacesPage.module.css';

// The Scallop Edge SVG to create the transition
const ScallopEdge = () => (
  <svg 
    className={styles.wavyEdge} 
    viewBox="0 0 100 10" 
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path 
      d="M0,10 V5 Q5,10 10,5 T20,5 T30,5 T40,5 T50,5 T60,5 T70,5 T80,5 T90,5 T100,5 V10 Z" 
      fill="currentColor" 
    />
  </svg>
);

const DestinationCard = ({ place }) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <ImageSlot
          id={place.imageSlot}
          src={place.src}
          alt={place.alt}
          className={styles.image}
        />
        <ScallopEdge />
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{place.name}</h3>
        
        <div className={styles.cardDescription}>
          <p>{place.description}</p>
        </div>
        
        <div className={styles.cardFooter}>
          <a 
            href="/contact" 
            className={`pill-button pill-button-navy ${styles.exploreBtn}`}
          >
            ENQUIRE ABOUT VISIT <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
};

const NearbyPlacesPage = () => {
  const pageRef = useRef(null);
  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      gsap.from('.header-anim', {
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.2
      });

      gsap.from(`.${styles.card}`, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.4
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.pageContainer} ref={pageRef}>
      <SEO 
        title="Nearby Places & Attractions | The Conclave Dibrugarh"
        description="Explore nearby attractions, tea estates, and heritage spots around Dibrugarh while staying at The Conclave in Khanikar, Assam."
        path="/nearby-places"
      />
      <header className={`${styles.header} section-container`}>
        <div className={styles.headerInner}>
          <span className={`eyebrow header-anim ${styles.eyebrow}`}>LOCATION</span>
          <h1 className={`header-anim ${styles.heading}`}>
            NEARBY PLACES
          </h1>
          <p className={`header-anim ${styles.introText}`}>
            The Conclave is conveniently located in Khanikar, Dibrugarh, making it easy for guests to explore nearby attractions, emerald tea gardens, and heritage sites across Upper Assam.
          </p>
        </div>
      </header>

      <section className={styles.gridSection}>
        <div className={styles.gridWrapper}>
          <div className={styles.grid}>
            {nearbyPlacesData.map((place) => (
              <DestinationCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default NearbyPlacesPage;
