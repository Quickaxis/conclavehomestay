import React from 'react';
import { useBookingModal } from '../context/BookingContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { openModal } = useBookingModal();

  return (
    <footer className={styles.footer} aria-label="Site Footer">
      <div className={`section-container ${styles.container}`}>
        
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.brandHeader}>
              <a href="/" className={styles.logoLink} aria-label="The Conclave Homestay Home">
                <img 
                  src="/images/logo.jpg" 
                  alt="The Conclave Homestay Logo" 
                  className={styles.footerLogo} 
                />
              </a>
              <a href="/" className={styles.logo}>THE CONCLAVE HOMESTAY</a>
            </div>
            <p className={styles.brandDesc}>
              A considered stay in Khanikar, Dibrugarh, Assam. Six guest rooms, thoughtfully designed for a welcoming stay.
            </p>
          </div>
          
          <div className={styles.linksGrid}>
            <div className={styles.linkGroup}>
              <h4>EXPLORE</h4>
              <a href="/" className={styles.footerLink}>Home</a>
              <a href="/rooms" className={styles.footerLink}>Our Rooms</a>
              <a href="/nearby-places" className={styles.footerLink}>Nearby Places</a>
              <a href="/#gallery" className={styles.footerLink}>Photo Gallery</a>
              <a href="/about" className={styles.footerLink}>About Us</a>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>COMPANY</h4>
              <a href="/about" className={styles.footerLink}>About The Conclave</a>
              <a href="/contact" className={styles.footerLink}>Contact</a>
              <a href="/#faq" className={styles.footerLink}>Guest Information</a>
              <button 
                type="button"
                onClick={openModal}
                className={styles.footerLink}
              >
                Booking Enquiry
              </button>
            </div>
            
            <div className={styles.linkGroup}>
              <h4>TALK TO US</h4>
              <button 
                type="button"
                onClick={openModal}
                className={`${styles.footerLink} ${styles.bookStayBtn}`}
              >
                Book Your Stay &rarr;
              </button>
              <a href="/contact" className={styles.footerLink}>Direct Enquiry</a>
              <p className={styles.locationDetail}>
                Khanikar, Dibrugarh, Assam
              </p>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} The Conclave. All rights reserved.
          </div>
          <div className={styles.location}>
            <div>The Conclave — Lodging & Homestay</div>
            <div>Khanikar • Dibrugarh • Assam</div>
          </div>
        </div>
        
      </div>
      
      {/* Decorative Background Element */}
      <div className={styles.decorativeBg} aria-hidden="true">TC</div>
    </footer>
  );
};

export default Footer;
