import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RoomSection from './components/RoomSection';
import NearbyPlacesSection from './components/NearbyPlacesSection';
import FAQSection from './components/FAQSection';
import WhyChooseUs from './components/WhyChooseUs';
import TravellerReviews from './components/TravellerReviews';
import BookingCTA from './components/BookingCTA';
import GallerySection from './components/GallerySection';
import Footer from './components/Footer';
import RoomDetailPage from './components/RoomDetailPage';
import RoomsListPage from './components/RoomsListPage';
import AboutPage from './components/AboutPage';
import NearbyPlacesPage from './components/NearbyPlacesPage';
import ContactPage from './components/ContactPage';
import NotFoundPage from './components/NotFoundPage';
import { BookingProvider } from './context/BookingContext';
import BookYourStayModal from './components/BookYourStayModal';
import SEO from './components/SEO';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Intercept local links to use History API
  useEffect(() => {
    const handleLinkClick = (e) => {
      const target = e.target.closest('a');
      if (target && target.href && target.href.startsWith(window.location.origin) && !target.getAttribute('target')) {
        const url = new URL(target.href);
        // If it's just a hash link on the same path, let default behavior handle smooth scroll
        if (url.pathname === window.location.pathname && url.hash) {
          e.preventDefault();
          const el = document.querySelector(url.hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState({}, '', url.pathname + url.search + url.hash);
          }
          return;
        }
        
        e.preventDefault();
        window.history.pushState({}, '', url.pathname + url.search + url.hash);
        setCurrentPath(url.pathname);
        window.scrollTo(0, 0);
        
        // Handle hash scrolling if navigating to a new page with a hash
        if (url.hash) {
          setTimeout(() => {
            const el = document.querySelector(url.hash);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  const isRoomDetailPage = currentPath.startsWith('/rooms/') && currentPath.length > 7;
  const isRoomsListPage = currentPath === '/rooms' || currentPath === '/rooms/';
  const isAboutPage = currentPath === '/about' || currentPath === '/about/';
  const isNearbyPlacesPage = currentPath === '/nearby-places' || currentPath === '/nearby-places/';
  const isContactPage = currentPath === '/contact' || currentPath === '/contact/';
  const isHomePage = currentPath === '/' || currentPath === '';
  const isKnownPage = isHomePage || isRoomDetailPage || isRoomsListPage || isAboutPage || isNearbyPlacesPage || isContactPage;

  const roomId = isRoomDetailPage ? currentPath.split('/').pop() : null;

  return (
    <BookingProvider>
      <div className="texture-bg"></div>
      
      {/* Homepage SEO */}
      {isHomePage && (
        <SEO 
          title="The Conclave | Lodging and Homestay in Dibrugarh, Assam"
          description="The Conclave is a design-led lodging and homestay in Khanikar, Dibrugarh, Assam. Explore our six rooms and in-house restaurant for a considered stay."
          path="/"
          schema={{
            "@type": "LodgingBusiness",
            "name": "The Conclave",
            "description": "Boutique lodging and homestay in Khanikar, Dibrugarh, Assam.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Khanikar",
              "addressLocality": "Dibrugarh",
              "addressRegion": "Assam",
              "addressCountry": "IN"
            }
          }}
        />
      )}

      <Navbar currentPath={currentPath} />
      
      {isHomePage && <Hero />}
      
      <main className={`content-layer ${isHomePage ? 'homepage-layer' : ''}`}>
        {!isKnownPage ? (
          <NotFoundPage />
        ) : isRoomDetailPage ? (
          <RoomDetailPage roomId={roomId} />
        ) : isRoomsListPage ? (
          <RoomsListPage />
        ) : isAboutPage ? (
          <AboutPage />
        ) : isNearbyPlacesPage ? (
          <NearbyPlacesPage />
        ) : isContactPage ? (
          <ContactPage />
        ) : (
          <>
            <RoomSection />
            <NearbyPlacesSection />
            <FAQSection />
            <WhyChooseUs />
            <TravellerReviews />
            <BookingCTA />
            <GallerySection />
          </>
        )}
        <Footer />
      </main>
      
      <BookYourStayModal />
    </BookingProvider>
  );
}

export default App;
