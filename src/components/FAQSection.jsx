import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { faqData } from '../data/faq';
import styles from './FAQSection.module.css';
import { useBookingModal } from '../context/BookingContext';

const FAQItem = ({ faq, isOpen, onClick }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      gsap.to(contentRef.current, {
        height: 'auto',
        duration: 0.4,
        ease: 'power2.out'
      });
      gsap.to(contentRef.current, {
        opacity: 1,
        duration: 0.3,
        delay: 0.1,
        ease: 'power2.out'
      });
    } else {
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in'
      });
      gsap.to(contentRef.current, {
        height: 0,
        duration: 0.4,
        ease: 'power2.inOut'
      });
    }
  }, [isOpen]);

  return (
    <div className={styles.faqItem}>
      <button 
        className={styles.faqQuestionBtn} 
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <h3 className={styles.questionText}>{faq.question}</h3>
        <div className={`${styles.iconWrapper} ${isOpen ? styles.iconOpen : ''}`}>
          {isOpen ? <X size={20} /> : <Plus size={20} />}
        </div>
      </button>
      <div 
        ref={contentRef} 
        className={styles.faqAnswerWrapper}
        style={{ height: 0, opacity: 0, overflow: 'hidden' }}
      >
        <p className={styles.answerText}>{faq.answer}</p>
      </div>
    </div>
  );
};

const FAQSection = () => {
  const [openId, setOpenId] = useState(null);
  const { openModal } = useBookingModal();

  const defaultWhatsappMsg = encodeURIComponent("Hi The Conclave, I have a question about staying at your homestay in Khanikar, Dibrugarh!");

  return (
    <section id="faq" className={styles.section}>
      <div className={`section-container ${styles.container}`}>
        
        <div className={styles.leftCol}>
          <span className="eyebrow">BEFORE YOU STAY</span>
          <h2 className={styles.heading}>FREQUENTLY ASKED QUESTIONS</h2>
          <p className={styles.supportingText}>
            Have questions before your arrival? Here are transparent answers regarding check-in, our six boutique rooms, amenities, and policies at The Conclave.
          </p>
          
          <div className={styles.actionButtons}>
            <button onClick={openModal} className="pill-button pill-button-navy">
              BOOK YOUR STAY
            </button>
            <a 
              href={`https://wa.me/?text=${defaultWhatsappMsg}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`pill-button ${styles.outlineBtn}`}
              style={{ textDecoration: 'none', display: 'inline-flex' }}
            >
              <MessageCircle size={18} /> WHATSAPP US
            </a>
          </div>
        </div>
        
        <div className={styles.rightCol}>
          <div className={styles.accordion}>
            {faqData.map((faq) => (
              <FAQItem 
                key={faq.id}
                faq={faq}
                isOpen={openId === faq.id}
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default FAQSection;
