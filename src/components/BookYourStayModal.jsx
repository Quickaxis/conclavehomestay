import React, { useEffect, useRef } from 'react';
import { X, MessageCircle, Phone } from 'lucide-react';
import { useBookingModal } from '../context/BookingContext';
import styles from './BookYourStayModal.module.css';

const BookYourStayModal = () => {
  const { isModalOpen, closeModal } = useBookingModal();
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, closeModal]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  if (!isModalOpen) return null;

  const defaultWhatsappMsg = encodeURIComponent("Hi The Conclave, I would like to check availability and enquire about booking a stay at your homestay in Khanikar, Dibrugarh!");

  return (
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className={styles.modal} ref={modalRef}>
        <button 
          className={styles.closeBtn} 
          onClick={closeModal}
          aria-label="Close modal"
        >
          <X size={20} />
        </button>
        
        <img 
          src="/images/logo.jpg" 
          alt="The Conclave Logo" 
          className={styles.modalLogo} 
        />
        
        <h2 id="booking-modal-title" className={styles.title}>
          BOOK YOUR STAY
        </h2>
        <p className={styles.subtitle}>
          Direct Booking with The Conclave Host
        </p>
        <p className={styles.scheduleText}>
          Khanikar, Dibrugarh, Assam
        </p>

        <div className={styles.buttonGroup}>
          <a 
            href={`https://wa.me/?text=${defaultWhatsappMsg}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.bookNowBtn}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <MessageCircle size={18} /> BOOK VIA WHATSAPP NOW
          </a>
          
          <a 
            href="tel:+91" 
            className={styles.callBtn}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Phone size={18} /> CALL TO BOOK
          </a>
          
          <div className={styles.alternateNumberWrapper}>
            <span className={styles.alternateNumber}>
              Direct Host Assistance • 6 Boutique Rooms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookYourStayModal;
