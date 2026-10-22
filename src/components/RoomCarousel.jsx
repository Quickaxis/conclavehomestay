import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import ImageSlot from './ImageSlot';
import styles from './RoomCarousel.module.css';

const RoomCarousel = ({ roomId, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Touch handling for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      nextImage();
    } else if (distance < -swipeThreshold) {
      prevImage();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div className={styles.carouselContainer}>
      {/* Main Image */}
      <div 
        className={styles.mainImageWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button className={styles.fullscreenBtn} aria-label="Fullscreen">
          <Maximize2 />
        </button>

        <div className={styles.controls}>
          <button className={styles.controlBtn} onClick={prevImage} aria-label="Previous image">
            <ChevronLeft />
          </button>
          <button className={styles.controlBtn} onClick={nextImage} aria-label="Next image">
            <ChevronRight />
          </button>
        </div>

        <div className={styles.mainImageInner}>
          {images.map((imageId, index) => (
            <div 
              key={imageId} 
              className={`${styles.imageSlotWrapper} ${index === currentIndex ? styles.imageSlotActive : ''}`}
            >
              <ImageSlot
                id={imageId}
                alt={`${roomId} view ${index + 1}`}
                aspectRatio="16/10"
                overlay={false}
              />
            </div>
          ))}
        </div>

        <div className={styles.pagination}>
          {images.map((_, index) => (
            <div 
              key={index} 
              className={`${styles.dot} ${index === currentIndex ? styles.dotActive : ''}`} 
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className={styles.thumbnailStrip}>
        {images.map((imageId, index) => (
          <div 
            key={imageId} 
            className={`${styles.thumbnail} ${index === currentIndex ? styles.thumbnailActive : ''}`}
            onClick={() => setCurrentIndex(index)}
          >
            <div className={styles.thumbnailImageWrapper}>
              <ImageSlot
                id={imageId}
                alt={`Thumbnail ${index + 1}`}
                aspectRatio="1/1"
                overlay={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCarousel;
