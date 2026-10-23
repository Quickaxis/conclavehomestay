import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import SEO from './SEO';
import styles from './ContactPage.module.css';
import { useBooking } from '../context/BookingContext';

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ContactPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  
  const { submitEnquiry, openModal } = useBooking();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.phone.trim() || formState.phone.trim().length < 8) {
      newErrors.phone = 'A valid phone number (at least 8 digits) is required';
    }
    if (!formState.message.trim()) newErrors.message = 'Please tell us about your stay dates and guests';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSubmitting(true);

    const result = await submitEnquiry({
      name: formState.name.trim(),
      phone: formState.phone.trim(),
      email: formState.email.trim() || null,
      message: formState.message.trim()
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
    } else {
      setErrors({ form: result.error || 'Failed to submit stay enquiry. Please try again.' });
    }
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
    
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div id="contact" className={styles.pageWrapper}>
      <SEO 
        title="Contact The Conclave | Dibrugarh, Assam"
        description="Contact The Conclave in Khanikar, Dibrugarh for room bookings, pricing, and stay enquiries. Reach our team directly via our stay enquiry form."
        path="/contact"
      />
      <div className={`section-container ${styles.container}`}>
        
        <div className={styles.topContent}>
          <div className={styles.brandBadgeWrapper}>
            <img 
              src="/images/logo.jpg" 
              alt="The Conclave Homestay Logo" 
              className={styles.pageLogo} 
            />
          </div>
          <span className={styles.eyebrow}>SAY HELLO</span>
          <h2 className={styles.heading}>TALK TO US</h2>
          <p className={styles.supportingText}>
            Planning your stay in Dibrugarh? Have a question about our six boutique rooms, amenities, location, or direct booking? We’re always here to assist you.
          </p>
        </div>

        <div className={styles.grid}>
          
          {/* Left Column: Contact Cards */}
          <div className={styles.leftCol}>
            
            <div className={styles.contactCard}>
              <div className={styles.iconWrapper}>
                <Phone size={24} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>PROPERTY ASSISTANCE</span>
                <span className={styles.cardMain}>Direct Host Assistance</span>
                <span className={styles.cardSub}>Submit stay enquiry below for direct follow-up</span>
              </div>
            </div>

            <button 
              type="button" 
              onClick={openModal} 
              className={styles.contactCard}
              style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer' }}
            >
              <div className={styles.iconWrapper}>
                <MessageCircle size={24} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>STAY ENQUIRY MODAL</span>
                <span className={styles.cardMain}>Submit Stay Enquiry</span>
                <span className={styles.cardSub}>Select dates and message property host</span>
              </div>
            </button>

            <div className={styles.contactCard}>
              <div className={styles.iconWrapper}>
                <InstagramIcon />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>INSTAGRAM</span>
                <span className={styles.cardMain}>@theconclavehomestay</span>
                <span className={styles.cardSub}>Follow our stories & updates</span>
              </div>
            </div>

            <div className={styles.locationCard}>
              <div className={styles.iconWrapper}>
                <MapPin size={24} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>LOCATION</span>
                <span className={styles.cardMain}>The Conclave, Khanikar, Dibrugarh</span>
                <span className={styles.cardSub}>Khanikar, Dibrugarh, Assam, India</span>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className={styles.rightCol}>
            <div className={styles.formCard}>
              <span className={styles.formEyebrow}>SEND STAY ENQUIRY</span>
              
              {isSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 8px' }}>
                  <CheckCircle2 size={44} style={{ color: '#2F855A', margin: '0 auto 14px' }} />
                  <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-burgundy)', fontSize: '20px', fontWeight: 700, margin: '0 0 8px' }}>
                    STAY ENQUIRY RECEIVED
                  </h3>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.5', margin: '0 0 16px' }}>
                    Thank you! We have received your inquiry. Please note that an enquiry is not a confirmed booking. Our team will contact you directly to confirm availability and details.
                  </p>
                  <div style={{ background: 'var(--color-cream, #F7F5F0)', padding: '12px 16px', borderRadius: '12px', fontSize: '12px', color: '#666', border: '1px solid rgba(197, 168, 128, 0.4)' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', color: 'var(--color-gold)', marginRight: '6px' }} />
                    Zero upfront payment required. Rates and bookings are finalized directly with the host.
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setIsSuccess(false); setFormState({ name: '', phone: '', email: '', message: '' }); }}
                    className={styles.submitBtn}
                    style={{ marginTop: '20px', width: 'auto', padding: '10px 24px', display: 'inline-block' }}
                  >
                    SEND ANOTHER ENQUIRY
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form} noValidate>
                  {errors.form && (
                    <div style={{ background: '#FFF5F5', border: '1px solid #FEB2B2', color: '#C53030', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={15} />
                      <span>{errors.form}</span>
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label htmlFor="name">YOUR NAME *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      placeholder="Full name" 
                      value={formState.name}
                      onChange={handleChange}
                      className={errors.name ? styles.inputError : ''}
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">PHONE NUMBER *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      placeholder="+91 ..." 
                      value={formState.phone}
                      onChange={handleChange}
                      className={errors.phone ? styles.inputError : ''}
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="email">EMAIL <span className={styles.optional}>(Optional)</span></label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      placeholder="you@email.com" 
                      value={formState.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="message">STAY DATES & REQUIREMENTS *</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      placeholder="Preferred room, check-in & check-out dates, guest count, or any questions..." 
                      rows="4"
                      value={formState.message}
                      onChange={handleChange}
                      className={errors.message ? styles.inputError : ''}
                    ></textarea>
                    {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                  </div>

                  <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                    {isSubmitting ? 'SENDING STAY ENQUIRY...' : 'SUBMIT STAY ENQUIRY'}
                  </button>
                  <p className={styles.formNote}>
                    Submitting an enquiry does not create a confirmed booking or lock room inventory. Host will confirm details directly. Payment is due at property.
                  </p>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
