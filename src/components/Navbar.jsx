import React, { useState, useEffect, useRef } from 'react';
import { Menu } from 'lucide-react';
import gsap from 'gsap';
import styles from './Navbar.module.css';
import MobileMenu from './MobileMenu';
import { useBooking } from '../context/BookingContext';

const Navbar = ({ currentPath = '/' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openBookNowMenu } = useBooking();
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion && navRef.current) {
        gsap.from(navRef.current, {
          opacity: 0,
          y: -24,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all'
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const getLinkClass = (path) => {
    if (path === '/') {
      return currentPath === '/' ? styles.active : '';
    }
    return currentPath.startsWith(path) ? styles.active : '';
  };

  return (
    <>
      <nav ref={navRef} className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`} aria-label="Main Navigation">
        <div className={styles.navbarInner}>
          <a href="/" className={styles.brandLink}>
            <img 
              src="/images/logo.jpg" 
              alt="The Conclave Logo" 
              className={styles.navLogo} 
            />
            <span className={styles.logoText}>THE CONCLAVE</span>
          </a>
          
          <div className={styles.desktopMenu}>
            <a href="/" className={getLinkClass('/')}>HOME</a>
            <a href="/rooms" className={getLinkClass('/rooms')}>ROOMS</a>
            <a href="/about" className={getLinkClass('/about')}>ABOUT</a>
            <a href="/nearby-places" className={getLinkClass('/nearby-places')}>NEARBY PLACES</a>
            <a href="/contact" className={getLinkClass('/contact')}>CONTACT</a>
          </div>

          <div className={styles.actions}>
            {!(currentPath === '/rooms' || currentPath === '/rooms/' || currentPath.startsWith('/rooms/')) && (
              <button
                onClick={openBookNowMenu}
                className={`pill-button ${styles.bookBtn}`}
                style={{ display: 'inline-flex', cursor: 'pointer' }}
              >
                BOOK NOW
              </button>
            )}
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </>
  );
};

export default Navbar;
