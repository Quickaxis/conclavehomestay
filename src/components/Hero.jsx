import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section id="home" className={styles.heroSection}>
      <div className={styles.imageWrapper} data-hero-image>
        <picture>
          <source media="(max-width: 768px)" srcSet="/images/heromobile.webp" />
          <img 
            src="/images/heropc.webp" 
            alt="The Conclave Homestay in Khanikar, Dibrugarh, Assam" 
            className={styles.heroImage}
            fetchpriority="high"
            loading="eager"
            decoding="sync"
          />
        </picture>
        <div className={styles.imageOverlay}></div>
      </div>
    </section>
  );
};

export default Hero;
