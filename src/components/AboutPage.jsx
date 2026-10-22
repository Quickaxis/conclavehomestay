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
        description="Discover The Conclave, a design-led lodging and homestay in Khanikar, Dibrugarh. Thoughtfully envisioned for families, business travellers and those exploring Upper Assam."
        path="/about"
      />

      {/* Hero Section */}
      <section className={`${styles.heroSection} section-container`}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <span className={`eyebrow hero-anim ${styles.eyebrow}`}>ABOUT THE CONCLAVE</span>
            <h1 className={`hero-anim ${styles.mainHeading}`}>
              A MORE THOUGHTFUL WAY TO STAY IN DIBRUGARH.
            </h1>
            <p className={`hero-anim ${styles.heroText}`}>
              Discover The Conclave, a design-led lodging and homestay in Khanikar, Dibrugarh. Thoughtfully envisioned for families, business travellers and those exploring Upper Assam, it brings together considered interiors, a welcoming atmosphere and the ease of a more personal stay.
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
            <span className={`eyebrow story-text ${styles.eyebrow}`}>OUR PHILOSOPHY</span>
            <h2 className={`story-text ${styles.storyHeading}`}>
              GOOD DESIGN. QUIET COMFORT. A WARM WELCOME.
            </h2>
          </div>
          <div className={styles.storyRight}>
            <p className="story-text">
              Travel can be full of plans, movement and new experiences. Your stay should offer a little room to slow down. At The Conclave, we believe hospitality is found in the details—in a thoughtfully arranged space, a welcoming atmosphere and the freedom to settle in at your own pace.
            </p>
            <p className="story-text">
              With six rooms, an in-house restaurant and a location in Khanikar, The Conclave offers a considered base for family visits, work trips and journeys across Upper Assam.
            </p>
            <p className="story-text">
              Our approach is simple: create a place that feels distinctive without feeling complicated, and welcoming without being overstated.
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
            <h3 className={styles.cardTitle}>THOUGHTFUL DESIGN</h3>
            <p className={styles.cardText}>Considered interiors and a carefully shaped atmosphere create a welcoming setting for your time away.</p>
          </div>
          
          <div className={`value-card ${styles.valueCard}`}>
            <span className={styles.cardNumber}>02</span>
            <h3 className={styles.cardTitle}>JUST SIX ROOMS</h3>
            <p className={styles.cardText}>Six guest rooms give The Conclave its own intimate character, with space to make your stay your own.</p>
          </div>
          
          <div className={`value-card ${styles.valueCard}`}>
            <span className={styles.cardNumber}>03</span>
            <h3 className={styles.cardTitle}>ROOTED IN KHANIKAR</h3>
            <p className={styles.cardText}>Stay in Khanikar, Dibrugarh, with a convenient base for your visit to Upper Assam.</p>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className={`${styles.locationSection} section-container`}>
        <div className={styles.locationGrid}>
          <div className={styles.locationContent}>
            <span className={`eyebrow location-anim ${styles.eyebrow}`}>OUR LOCATION</span>
            <h2 className={`location-anim ${styles.locationHeading}`}>
              YOUR STAY IN KHANIKAR, DIBRUGARH.
            </h2>
            <p className={`location-anim ${styles.locationText}`}>
              Set in Khanikar, Dibrugarh, Assam, The Conclave welcomes guests visiting for work, family occasions or a journey through Upper Assam. Make yourself at home and discover the area at your own pace.
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
