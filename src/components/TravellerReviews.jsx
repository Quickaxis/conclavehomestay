import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Star, Quote, ArrowUpRight } from 'lucide-react';
import styles from './TravellerReviews.module.css';
import { useBookingModal } from '../context/BookingContext';

const LeftArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const RightArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

const REVIEWS = [
  {
    id: 'rev-1',
    author: "The Conclave",
    role: "Khanikar Chariali, Dibrugarh",
    rating: 0,
    date: "Homestay Lodging",
    quote: "Welcome to The Conclave — Lodging and Homestay, a comfortable place to stay in Khanikar Chariali, Dibrugarh, Assam. With six thoughtfully arranged rooms, a shared dining area, and essential in-room comforts, The Conclave offers a convenient stay for travellers visiting Dibrugarh."
  },
  {
    id: 'rev-2',
    author: "Thoughtful Rooms",
    role: "Six Boutique Rooms",
    rating: 0,
    date: "Room Selection",
    quote: "Choose from our Vista Rooms with highway-facing balconies, the spacious Grand Suite with additional room to relax, or our comfortable standard rooms. Every room includes air conditioning, a television, and an attached bathroom."
  },
  {
    id: 'rev-3',
    author: "Convenient Location",
    role: "Highway Access",
    rating: 0,
    date: "Khanikar Chariali",
    quote: "The highway location makes the property convenient for travellers visiting Dibrugarh or journeying through Upper Assam, approximately 10 minutes from Dibrugarh Airport."
  },
  {
    id: 'rev-4',
    author: "Plan Your Visit",
    role: "Direct Reservations",
    rating: 0,
    date: "Enquiries & Stays",
    quote: "Explore our six rooms and get in touch to enquire about your dates. We look forward to helping you plan your stay at The Conclave."
  }
];

const TravellerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { openModal } = useBookingModal();
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const trackRef = useRef(null);
  const autoplayTimer = useRef(null);

  const renderedReviews = [
    REVIEWS[REVIEWS.length - 1],
    ...REVIEWS,
    REVIEWS[0]
  ];

  const totalRealSlides = REVIEWS.length;

  const nextReview = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    resetAutoplay();
  }, [isTransitioning]);

  const prevReview = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    resetAutoplay();
  }, [isTransitioning]);

  const resetAutoplay = useCallback(() => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
    }
    autoplayTimer.current = setInterval(() => {
      if (!isDragging) {
        nextReview();
      }
    }, 6000);
  }, [nextReview, isDragging]);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayTimer.current) clearInterval(autoplayTimer.current);
    };
  }, [resetAutoplay]);

  const handleTransitionEnd = () => {
    setIsTransitioning(false);
    if (currentIndex === 0) {
      setCurrentIndex(totalRealSlides);
    } else if (currentIndex === totalRealSlides + 1) {
      setCurrentIndex(1);
    }
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    setDragOffset(0);
    if (autoplayTimer.current) clearInterval(autoplayTimer.current);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    touchEndX.current = e.targetTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const distance = touchEndX.current - touchStartX.current;
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      prevReview();
    } else if (distance < -swipeThreshold) {
      nextReview();
    }
    
    setDragOffset(0);
    resetAutoplay();
  };

  let activeDotIndex = currentIndex - 1;
  if (activeDotIndex === -1) activeDotIndex = totalRealSlides - 1;
  if (activeDotIndex === totalRealSlides) activeDotIndex = 0;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.eyebrow}>GUEST IMPRESSIONS</span>
            <h2 className={styles.heading}>A PERSONAL APPROACH TO HOSPITALITY.</h2>
          </div>
          
          <div className={styles.controls}>
            <button 
              className={styles.arrowBtn} 
              onClick={prevReview}
              aria-label="Previous review"
            >
              <LeftArrowIcon />
            </button>
            <button 
              className={styles.arrowBtn} 
              onClick={nextReview}
              aria-label="Next review"
            >
              <RightArrowIcon />
            </button>
          </div>
        </div>

        <div 
          className={styles.carouselViewport}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className={styles.carouselTrack}
            ref={trackRef}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translate3d(calc(-${currentIndex} * var(--slide-width, 100%) + ${dragOffset}px), 0, 0)`,
              transition: isTransitioning && !isDragging ? 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
            }}
          >
            {renderedReviews.map((review, index) => (
              <div 
                key={`${review.id}-${index}`} 
                className={styles.cardSlot}
              >
                <div 
                  className={styles.innerCard}
                  onClick={openModal}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.quoteIconWrapper}>
                    <Quote size={28} className={styles.quoteIcon} />
                  </div>
                  
                  {review.rating > 0 && (
                    <div className={styles.starsRow}>
                      <div className={styles.starsGroup}>
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={18} fill="#C5A15A" color="#C5A15A" />
                        ))}
                      </div>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                  )}

                  <p className={styles.reviewQuote}>
                    "{review.quote}"
                  </p>

                  <div className={styles.reviewerMeta}>
                    <div className={styles.reviewerAvatar}>
                      {review.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className={styles.reviewerName}>{review.author}</h4>
                      <span className={styles.reviewerRole}>{review.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.pagination}>
          {REVIEWS.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === activeDotIndex ? styles.dotActive : ''}`} 
            />
          ))}
        </div>

        <div className={styles.bottomCtaContainer}>
          <button onClick={openModal} className={styles.viewReviewsBtn}>
            ENQUIRE ABOUT YOUR STAY
            <div className={styles.ctaCircle}>
              <ArrowUpRight size={20} strokeWidth={2.5} />
            </div>
          </button>
        </div>

      </div>
    </section>
  );
};

export default TravellerReviews;
