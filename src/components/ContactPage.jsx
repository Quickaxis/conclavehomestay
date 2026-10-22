import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';
import SEO from './SEO';
import styles from './ContactPage.module.css';

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
  
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formState.name.trim()) newErrors.name = 'Name is required';
    if (!formState.phone.trim()) newErrors.phone = 'Phone / WhatsApp is required';
    if (!formState.message.trim()) newErrors.message = 'Please tell us about your stay dates and guests';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});

    // WhatsApp Message Format for The Conclave
    const text = `Hi The Conclave,

I would like to enquire about booking a stay at your homestay in Khanikar, Dibrugarh.

Name: ${formState.name}
Phone / WhatsApp: ${formState.phone}
Email: ${formState.email || "Not provided"}

Stay Details & Requirements:
${formState.message}

Thank you!`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    
    window.open(whatsappUrl, '_blank');
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
        description="Contact The Conclave in Khanikar, Dibrugarh for room bookings, pricing, and stay enquiries. Reach host directly via Call or WhatsApp."
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
            
            <a href="tel:+91" className={styles.contactCard}>
              <div className={styles.iconWrapper}>
                <Phone size={24} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>CALL DIRECTLY</span>
                <span className={styles.cardMain}>Call The Conclave Host</span>
                <span className={styles.cardSub}>Direct personal assistance for your stay</span>
              </div>
            </a>

            <a 
              href="https://wa.me/?text=Hi%20The%20Conclave%2C%20I%20would%20like%20to%20enquire%20about%20booking%20a%20stay!" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.contactCard}
            >
              <div className={styles.iconWrapper}>
                <MessageCircle size={24} />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardEyebrow}>WHATSAPP INQUIRY</span>
                <span className={styles.cardMain}>Chat with The Conclave</span>
                <span className={styles.cardSub}>Fastest confirmation & instant replies</span>
              </div>
            </a>

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
              <span className={styles.formEyebrow}>SEND DIRECT INQUIRY</span>
              
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="name">YOUR NAME</label>
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
                  <label htmlFor="phone">PHONE / WHATSAPP</label>
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
                  <label htmlFor="message">STAY DATES & REQUIREMENTS</label>
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

                <button type="submit" className={styles.submitBtn}>
                  SEND VIA WHATSAPP &rarr;
                </button>
                <p className={styles.formNote}>
                  Your message connects directly with The Conclave on WhatsApp for fastest confirmation.
                </p>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
