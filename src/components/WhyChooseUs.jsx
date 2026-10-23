import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './WhyChooseUs.module.css';

gsap.registerPlugin(ScrollTrigger);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"></path>
  </svg>
);

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

const featuresData = [
  {
    id: 0,
    icon: SparkleIcon,
    title: "A COMFORTABLE STAY",
    desc: "Welcome to The Conclave — Lodging and Homestay. Six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts."
  },
  {
    id: 1,
    icon: HomeIcon,
    title: "SIX THOUGHTFUL ROOMS",
    desc: "Choose from 2 Vista Rooms with highway-facing balconies, 1 spacious Grand Suite with two ACs and sofa, or 3 comfortable standard rooms."
  },
  {
    id: 2,
    icon: MapPinIcon,
    title: "KHANIKAR CHARIALI",
    desc: "Convenient highway location in Khanikar Chariali, Dibrugarh, approximately 10 minutes from Dibrugarh Airport."
  }
];

const extendedFeatures = [
  { ...featuresData[2], uniqueKey: 'clone-last' },
  { ...featuresData[0], uniqueKey: '0' },
  { ...featuresData[1], uniqueKey: '1' },
  { ...featuresData[2], uniqueKey: '2' },
  { ...featuresData[0], uniqueKey: 'clone-first' }
];

const WhyChooseUs = () => {
  const sectionRef = useRef(null);
  const routePathRef = useRef(null);
  const headerRef = useRef(null);
  const div1Ref = useRef(null);
  const div2Ref = useRef(null);
  const statsRef = useRef([]);
  const cardsRef = useRef([]);
  const carouselTrackRef = useRef(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 75%",
      }
    });

    if (routePathRef.current) {
      tl.fromTo(routePathRef.current, 
        { strokeDasharray: 2500, strokeDashoffset: 2500, opacity: 0 },
        { strokeDashoffset: 0, opacity: 1, duration: 2, ease: "power2.out" }
      );
    }

    tl.fromTo(headerRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=1.5"
    );

    tl.fromTo(div1Ref.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.6"
    );

    tl.fromTo(statsRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out" },
      "-=0.4"
    );

    tl.fromTo(div2Ref.current,
      { scaleX: 0, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 0.8, ease: "power2.out" },
      "-=0.2"
    );

    if (cardsRef.current.length > 0) {
      tl.fromTo(cardsRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power2.out" },
        "-=0.4"
      );
    }
  }, [isMobile]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === 0) {
      setCurrentIndex(extendedFeatures.length - 2);
    } else if (currentIndex === extendedFeatures.length - 1) {
      setCurrentIndex(1);
    }
  };

  const goToSlide = (index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
  };

  const nextSlide = () => goToSlide(currentIndex + 1);
  const prevSlide = () => goToSlide(currentIndex - 1);

  const handleTouchStart = (e) => {
    if (isTransitioning) return;
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isTransitioning) return;
    const currentXPos = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentXPos - startX;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragOffset < -50) {
      nextSlide();
    } else if (dragOffset > 50) {
      prevSlide();
    } else {
      setDragOffset(0); 
    }
  };

  const activeDot = currentIndex === 0 
    ? 2 
    : currentIndex === extendedFeatures.length - 1 
      ? 0 
      : currentIndex - 1;

  return (
    <section ref={sectionRef} id="about" className={styles.section}>
      <svg className={styles.topRoute} viewBox="0 0 1200 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path 
          ref={routePathRef}
          d="M-100,100 C 100,20 300,180 600,100 C 900,20 1100,180 1300,100" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="6 6"
        />
        <path d="M 600 100 l -10 -5 l 2 5 l -2 5 z" fill="currentColor" opacity="0.5" />
      </svg>

      <div className={`section-container ${styles.container}`}>
        <div ref={headerRef} className={styles.header}>
          <span className={styles.eyebrow}>THE CONCLAVE EXPERIENCE</span>
          <h2 className={styles.heading}>A COMFORTABLE STAY IN KHANIKAR CHARIALI, DIBRUGARH</h2>
        </div>

        <div ref={div1Ref} className={styles.dashedDivider}></div>

        <div className={styles.statsRow}>
          <div className={styles.statItem} ref={el => statsRef.current[0] = el}>
            <div className={styles.statValue}>6 ROOMS</div>
            <div className={styles.statLabel}>2 VISTA • 1 SUITE • 3 COMFORT</div>
          </div>
          <div className={styles.statItem} ref={el => statsRef.current[1] = el}>
            <div className={styles.statValue}>KHANIKAR CHARIALI</div>
            <div className={styles.statLabel}>DIBRUGARH, ASSAM</div>
          </div>
          <div className={styles.statItem} ref={el => statsRef.current[2] = el}>
            <div className={styles.statValue}>SHARED DINING AREA</div>
            <div className={styles.statLabel}>COMMON PROPERTY FACILITY</div>
          </div>
          <div className={styles.statItem} ref={el => statsRef.current[3] = el}>
            <div className={styles.statValue}>HIGHWAY LOCATION</div>
            <div className={styles.statLabel}>APPROX. 10 MINS FROM AIRPORT</div>
          </div>
        </div>

        <div ref={div2Ref} className={styles.dashedDivider}></div>
        
        {/* Feature Cards: Desktop 3-Card Grid */}
        {!isMobile ? (
          <div className={styles.featuresRowDesktop}>
            {featuresData.map((feature, idx) => (
              <div key={feature.id} className={styles.featureCard} ref={el => cardsRef.current[idx] = el}>
                <div className={styles.iconContainer}>
                  <feature.icon />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        ) : (
          /* Feature Cards: Mobile Swipe Carousel with Dots & Controls */
          <div className={styles.carouselContainer}>
            <div 
              className={styles.carouselViewport}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseMove={handleTouchMove}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
            >
              <div 
                className={styles.carouselTrack}
                ref={carouselTrackRef}
                onTransitionEnd={handleTransitionEnd}
                style={{
                  transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                  transition: isDragging || (!isTransitioning && (currentIndex === 1 || currentIndex === extendedFeatures.length - 2) && dragOffset === 0)
                    ? 'none' 
                    : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)'
                }}
              >
                {extendedFeatures.map((feature) => (
                  <div key={feature.uniqueKey} className={styles.carouselSlide}>
                    <div className={styles.featureCardMobile}>
                      <div className={styles.iconContainer}>
                        <feature.icon />
                      </div>
                      <h3>{feature.title}</h3>
                      <p>{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.carouselControls}>
              <button className={styles.arrowBtn} onClick={prevSlide} aria-label="Previous feature">
                <ArrowLeft />
              </button>
              
              <div className={styles.pagination}>
                {featuresData.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.dot} ${activeDot === idx ? styles.dotActive : ''}`}
                    onClick={() => goToSlide(idx + 1)}
                  />
                ))}
              </div>
              
              <button className={styles.arrowBtn} onClick={nextSlide} aria-label="Next feature">
                <ArrowRight />
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default WhyChooseUs;
