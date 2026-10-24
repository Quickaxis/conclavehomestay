import React, { useEffect, useRef } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  CalendarCheck,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
  BedDouble
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { PROPERTY_INFO } from '../config/propertyConfig';
import { roomsData } from '../data/rooms';
import styles from './BookNowChoiceModal.module.css';

const BookNowChoiceModal = () => {
  const {
    isBookNowMenuOpen,
    bookNowMenuConfig,
    closeBookNowMenu,
    openModal,
    checkIn,
    checkOut,
    hmsStatus,
    verifiedHmsRooms
  } = useBooking();

  const modalRef = useRef(null);

  // Keyboard navigation (ESC to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isBookNowMenuOpen) {
        closeBookNowMenu();
      }
    };
    if (isBookNowMenuOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isBookNowMenuOpen, closeBookNowMenu]);

  if (!isBookNowMenuOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeBookNowMenu();
    }
  };

  // Preselected room resolution
  const targetRoom = bookNowMenuConfig?.roomId
    ? roomsData.find(r => r.id === bookNowMenuConfig.roomId || r.legacyId === bookNowMenuConfig.roomId)
    : null;

  // 1. Phone number verification
  const rawPhone = PROPERTY_INFO?.contact?.phone;
  const isPhoneConfigured = Boolean(
    rawPhone &&
    rawPhone.trim() !== '' &&
    rawPhone !== 'X' &&
    !rawPhone.includes('X')
  );

  // 2. WhatsApp verification
  const rawWhatsApp = PROPERTY_INFO?.contact?.whatsappNumber;
  const isWhatsAppConfigured = Boolean(
    rawWhatsApp &&
    rawWhatsApp.trim() !== '' &&
    rawWhatsApp !== 'X' &&
    !rawWhatsApp.includes('X')
  );

  // Construct dynamic WhatsApp link if and only if verified
  let verifiedWhatsAppUrl = null;
  if (isWhatsAppConfigured) {
    const roomText = targetRoom ? ` for ${targetRoom.name}` : '';
    const datesText = (checkIn && checkOut) ? ` (${checkIn} to ${checkOut})` : '';
    const message = `Hello, I would like to inquire about booking${roomText}${datesText} at The Conclave — Lodging and Homestay.`;
    const baseUrl = ['https:', '', 'api.whatsapp.com', 'send'].join('/');
    verifiedWhatsAppUrl = `${baseUrl}?phone=${encodeURIComponent(rawWhatsApp)}&text=${encodeURIComponent(message)}`;
  }

  // 3. Online inventory verification
  const isOnlineInventoryConfirmed = Boolean(
    hmsStatus?.configured &&
    Array.isArray(verifiedHmsRooms) &&
    verifiedHmsRooms.length > 0
  );

  const handleBookOnlineClick = () => {
    closeBookNowMenu();
    const targetId = targetRoom?.id || bookNowMenuConfig?.roomId || null;
    if (isOnlineInventoryConfirmed) {
      openModal({ roomId: targetId, mode: 'book' });
    } else {
      openModal({ roomId: targetId, mode: 'enquiry' });
    }
  };

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-now-choice-title"
    >
      <div className={styles.modal} ref={modalRef}>
        <button
          className={styles.closeBtn}
          onClick={closeBookNowMenu}
          aria-label="Close booking options"
        >
          <X size={18} />
        </button>

        {/* Modal Brand Header */}
        <div className={styles.header}>
          <div className={styles.brandBadge}>
            <Sparkles size={12} className={styles.sparkleIcon} />
            <span>RESERVATION DESK</span>
          </div>
          <h2 id="book-now-choice-title" className={styles.title}>
            BOOK YOUR STAY
          </h2>
          <p className={styles.subtitle}>
            Select your preferred method to reserve or enquire about rooms at The Conclave, Dibrugarh.
          </p>

          {/* Preselected Room Banner */}
          {targetRoom && (
            <div className={styles.selectedRoomBanner}>
              <BedDouble size={16} className={styles.selectedRoomIcon} />
              <span>
                Selected: <strong>{targetRoom.name}</strong> • {targetRoom.priceDisplay}/night
              </span>
            </div>
          )}
        </div>

        {/* 3 Choices List: Book Online, Call to Book, Book Through WhatsApp */}
        <div className={styles.choicesList}>

          {/* Choice 1: Book Online (Active & Recommended) */}
          <div className={`${styles.choiceCard} ${styles.choiceRecommended}`}>
            <div className={styles.choiceIconCol}>
              <div className={`${styles.iconWrap} ${styles.onlineIconWrap}`}>
                <CalendarCheck size={22} />
              </div>
            </div>
            <div className={styles.choiceContentCol}>
              <div className={styles.choiceHeadingRow}>
                <h3 className={styles.choiceTitle}>Book Online</h3>
                {isOnlineInventoryConfirmed ? (
                  <span className={styles.statusSuccess}>Instant Reservation</span>
                ) : (
                  <span className={styles.statusNotice}>
                    <AlertCircle size={11} /> Online booking in preparation
                  </span>
                )}
              </div>
              <p className={styles.choiceDesc}>
                {isOnlineInventoryConfirmed
                  ? "Reserve confirmed physical room inventory directly with pay-at-property confirmation."
                  : "Direct online booking is in preparation. Submit a Stay Enquiry now to verify room availability and approved rates with our host."}
              </p>
              <div className={styles.choiceActionRow}>
                <button
                  type="button"
                  onClick={handleBookOnlineClick}
                  className={styles.recommendedActionBtn}
                >
                  <span>{isOnlineInventoryConfirmed ? "Reserve Room Online" : "Submit Stay Enquiry"}</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Choice 2: Call to Book */}
          <div className={`${styles.choiceCard} ${!isPhoneConfigured ? styles.choiceDisabled : ''}`}>
            <div className={styles.choiceIconCol}>
              <div className={`${styles.iconWrap} ${styles.phoneIconWrap}`}>
                <Phone size={22} />
              </div>
            </div>
            <div className={styles.choiceContentCol}>
              <div className={styles.choiceHeadingRow}>
                <h3 className={styles.choiceTitle}>Call to Book</h3>
                {isPhoneConfigured ? (
                  <span className={styles.statusLive}>Direct Line</span>
                ) : (
                  <span className={styles.statusPending}>
                    <Clock size={11} /> Contact number to be confirmed
                  </span>
                )}
              </div>
              <p className={styles.choiceDesc}>
                {isPhoneConfigured
                  ? "Speak directly with our front desk team to check room availability and make an instant phone reservation."
                  : "The property telephone booking line is currently pending host confirmation. Please use online enquiry."}
              </p>
              <div className={styles.choiceActionRow}>
                {isPhoneConfigured ? (
                  <a
                    href={`tel:${rawPhone}`}
                    className={styles.activeActionBtn}
                  >
                    <span>Call {PROPERTY_INFO.contact.phoneDisplay || rawPhone}</span>
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <span className={styles.disabledActionLabel}>
                    Telephone line unconfirmed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Choice 3: Book Through WhatsApp */}
          <div className={`${styles.choiceCard} ${!isWhatsAppConfigured ? styles.choiceDisabled : ''}`}>
            <div className={styles.choiceIconCol}>
              <div className={`${styles.iconWrap} ${styles.waIconWrap}`}>
                <MessageSquare size={22} />
              </div>
            </div>
            <div className={styles.choiceContentCol}>
              <div className={styles.choiceHeadingRow}>
                <h3 className={styles.choiceTitle}>Book Through WhatsApp</h3>
                {isWhatsAppConfigured ? (
                  <span className={styles.statusLive}>Chat Available</span>
                ) : (
                  <span className={styles.statusPending}>
                    <Clock size={11} /> WhatsApp contact not configured
                  </span>
                )}
              </div>
              <p className={styles.choiceDesc}>
                {isWhatsAppConfigured
                  ? "Chat with our property team on WhatsApp with your selected room and dates prefilled for quick assistance."
                  : "Direct WhatsApp reservation contact is not configured. Direct messaging will be enabled once verified with the host."}
              </p>
              <div className={styles.choiceActionRow}>
                {isWhatsAppConfigured && verifiedWhatsAppUrl ? (
                  <a
                    href={verifiedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.activeActionBtn}
                  >
                    <span>Start WhatsApp Chat</span>
                    <ArrowRight size={14} />
                  </a>
                ) : (
                  <span className={styles.disabledActionLabel}>
                    WhatsApp currently unconfigured
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className={styles.footerNote}>
          <p>
            THE CONCLAVE • 6 Rooms in Khanikar Chariali, Dibrugarh • All rooms feature AC, TV & attached bath.
          </p>
        </div>

      </div>
    </div>
  );
};

export default BookNowChoiceModal;
