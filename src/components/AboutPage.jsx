import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import SEO from './SEO';
import styles from './AboutPage.module.css';
import { useBookingModal } from '../context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

const AboutPage = () => {
  const { openModal } = useBookingModal();
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Hero animations
      gsap.from('.hero-anim', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.2
      });

      // Story section
      gsap.from('.story-text', {
        scrollTrigger: {
          trigger: `.${styles.storySection}`,
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // Value cards
      gsap.from('.value-card', {
        scrollTrigger: {
          trigger: `.${styles.valuesSection}`,
          start: 'top 85%',
        },
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });

      // Location section
      gsap.from('.location-anim', {
        scrollTrigger: {
          trigger: `.${styles.locationSection}`,
          start: 'top 85%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

      // CTA section
      gsap.from('.cta-anim', {
        scrollTrigger: {
          trigger: `.${styles.ctaSection}`,
          start: 'top 90%',
        },
        y: 20,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out'
      });

    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.aboutPage} ref={pageRef}>
      <SEO 
        title="About The Conclave | Lodging & Homestay in Dibrugarh"
        description="Welcome to The Conclave — Lodging and Homestay in Khanikar Chariali, Dibrugarh, Assam. Six rooms, shared dining area, and highway convenience approximately 10 minutes from Dibrugarh Airport."
        path="/about"
      />

      {/* Hero Section */}
      <section className={`${styles.heroSection} section-container`}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <span className={`eyebrow hero-anim ${styles.eyebrow}`}>ABOUT THE CONCLAVE</span>
            <h1 className={`hero-anim ${styles.mainHeading}`}>
              A COMFORTABLE STAY IN KHANIKAR CHARIALI, DIBRUGARH
            </h1>
            <p className={`hero-anim ${styles.heroText}`}>
              Welcome to The Conclave — Lodging and Homestay, a comfortable place to stay in Khanikar Chariali, Dibrugarh, Assam. With six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts, The Conclave offers a convenient stay for travellers visiting Dibrugarh.
            </p>
          </div>
          
          <div className={`hero-anim ${styles.heroDecoration}`} aria-hidden="true">
            <span className={styles.largeOutlineText}>THE</span>
            <span className={styles.largeOutlineText}>CONCLAVE</span>
          </div>
        </div>
      </section>

      {/* Our Philosophy */}
      <section className={`${styles.storySection} section-container`}>
        <div className={styles.storyGrid}>
          <div className={styles.storyLeft}>
            <span className={`eyebrow story-text ${styles.eyebrow}`}>OUR PROPERTY</span>
            <h2 className={`story-text ${styles.storyHeading}`}>
              PRACTICAL COMFORTS. THOUGHTFUL ROOMS. A WARM WELCOME.
            </h2>
          </div>
          <div className={styles.storyRight}>
            <p className="story-text">
              Choose from our Vista Rooms with highway-facing balconies, the spacious Grand Suite with additional room to relax, or our comfortable standard rooms. Every room includes air conditioning, a television, and an attached bathroom.
            </p>
            <p className="story-text">
              With six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts, The Conclave offers a convenient stay for travellers visiting Dibrugarh.
            </p>
            <p className="story-text">
              Whether you are travelling through the region or visiting Dibrugarh, The Conclave offers a practical and welcoming base for your stay.
            </p>
          </div>
        </div>
      </section>

      {/* What Defines Us */}
      <section className={`${styles.valuesSection} section-container`}>
        <div className={styles.valuesHeader}>
          <span className={`eyebrow ${styles.eyebrow}`}>WHAT DEFINES US</span>
          <h2 className={styles.valuesHeading}>A STAY WITH ROOM TO BREATHE.</h2>
        </div>
        
        <div className={styles.valuesGrid}>
          <div className={`value-card ${styles.valueCard}`}>
            <span className={styles.cardNumber}>01</span>
            <h3 className={styles.cardTitle}>SIX THOUGHTFUL ROOMS</h3>
            <p className={styles.cardText}>Choose between Vista Rooms with highway-facing balconies, the spacious Grand Suite with extra room, or practical Comfort Rooms.</p>
          </div>
          
          <div className={`value-card ${styles.valueCard}`}>
            <span className={styles.cardNumber}>02</span>
            <h3 className={styles.cardTitle}>SHARED DINING AREA</h3>
            <p className={styles.cardText}>A dedicated common dining area on the property provides a welcoming space for guests to enjoy meals.</p>
          </div>
          
          <div className={`value-card ${styles.valueCard}`}>
            <span className={styles.cardNumber}>03</span>
            <h3 className={styles.cardTitle}>HIGHWAY CONVENIENCE</h3>
            <p className={styles.cardText}>Set along the highway in Khanikar Chariali, approximately 10 minutes from Dibrugarh Airport, making transit effortless.</p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={`${styles.locationSection} section-container`}>
        <div className={styles.locationGrid}>
          <div className={styles.locationContent}>
            <span className={`eyebrow location-anim ${styles.eyebrow}`}>OUR LOCATION</span>
            <h2 className={`location-anim ${styles.locationHeading}`}>
              YOUR STAY IN KHANIKAR CHARIALI, DIBRUGARH.
            </h2>
            <p className={`location-anim ${styles.locationText}`}>
              Located in Khanikar Chariali, Dibrugarh, Assam, The Conclave offers a practical and welcoming base for travellers visiting Dibrugarh or journeying through Upper Assam. The highway location provides effortless road connectivity, approximately 10 minutes from Dibrugarh Airport.
            </p>
          </div>
          
          <div className={`location-anim ${styles.locationDecoration}`} aria-hidden="true">
            <span className={styles.largeOutlineTextLocation}>KHANIKAR</span>
            <span className={styles.smallSolidTextLocation}>DIBRUGARH, ASSAM</span>
          </div>
        </div>
      </section>

      {/* Booking Call-to-Action Section */}
      <section className={`${styles.ctaSection} section-container`}>
        <div className={styles.ctaBox}>
          <span className={`eyebrow cta-anim ${styles.ctaEyebrow}`}>PLAN YOUR VISIT</span>
          <h2 className={`cta-anim ${styles.ctaHeading}`}>MAKE YOURSELF AT HOME.</h2>
          <p className={`cta-anim ${styles.ctaText}`}>
            Explore our six rooms and get in touch to enquire about your dates. We look forward to helping you plan your stay at The Conclave.
          </p>
          <div className={`cta-anim ${styles.ctaButtons}`}>
            <a href="/rooms" className={`pill-button ${styles.exploreBtn}`}>
              EXPLORE OUR SIX ROOMS <ArrowRight size={18} />
            </a>
            <button onClick={openModal} className={`pill-button ${styles.bookBtn}`}>
              ENQUIRE ABOUT YOUR STAY <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
