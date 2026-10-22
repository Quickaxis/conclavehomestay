import React, { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './BookingCTA.module.css';
import { useBookingModal } from '../context/BookingContext';

gsap.registerPlugin(ScrollTrigger);

const BookingCTA = () => {
  const sectionRef = useRef(null);
  const routeRef = useRef(null);
  const watermarkRef = useRef(null);
  const contentRef = useRef([]);
  const { openModal } = useBookingModal();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
      }
    });

    // Draw dashed route
    if (routeRef.current) {
      tl.fromTo(routeRef.current,
        { strokeDasharray: 2000, strokeDashoffset: 2000, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 2, ease: "power2.out" }
      );
    }

    // Stagger content
    tl.fromTo(contentRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" },
      "-=1.5"
    );

    // Fade in watermark
    if (watermarkRef.current) {
      tl.fromTo(watermarkRef.current,
        { opacity: 0, x: -30 },
        { opacity: 0.08, x: 0, duration: 1.5, ease: "power2.out" },
        "-=1.0"
      );
    }
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} aria-label="Book Your Stay Call to Action">
      
      {/* Decorative SVG Route */}
      <svg className={styles.svgRoute} viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path 
          ref={routeRef}
          d="M-100,100 C 200,160 400,20 700,100 C 1000,180 1200,60 1400,100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="8 8"
        />
      </svg>
      
      {/* Watermark TC */}
      <div ref={watermarkRef} className={styles.watermarkFA} aria-hidden="true">
        TC
      </div>
      
      <div className={`section-container ${styles.container}`}>
        <span 
          ref={el => contentRef.current[0] = el} 
          className={styles.eyebrow}
        >
          PLAN YOUR VISIT
        </span>
        
        <h2 
          ref={el => contentRef.current[1] = el} 
          className={styles.heading}
        >
          MAKE YOURSELF AT HOME.
        </h2>
        
        <p 
          ref={el => contentRef.current[2] = el} 
          className={styles.supportingText}
        >
          Explore our six rooms and get in touch to enquire about your dates. We look forward to helping you plan your stay at The Conclave.
        </p>
        
        <div 
          ref={el => contentRef.current[3] = el} 
          className={styles.actionButtons}
        >
          <a 
            href="/rooms" 
            className={`pill-button pill-button-white ${styles.mainBtn}`} 
            style={{ display: 'inline-flex', textDecoration: 'none' }}
          >
            EXPLORE OUR SIX ROOMS <ArrowRight size={18} />
          </a>
          <button 
            onClick={openModal} 
            className={`pill-button ${styles.outlineBtn}`}
            style={{ textDecoration: 'none', display: 'inline-flex', cursor: 'pointer', background: 'transparent' }}
          >
            <MessageCircle size={18} /> ENQUIRE ABOUT YOUR STAY
          </button>
        </div>
      </div>
      
    </section>
  );
};

export default BookingCTA;
