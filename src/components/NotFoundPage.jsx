import React, { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import SEO from './SEO';

const NotFoundPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <SEO 
        title="Page Not Found | The Conclave Dibrugarh"
        description="The page you are looking for does not exist. Return to The Conclave homepage or explore our six rooms in Khanikar, Dibrugarh."
        path="/404"
      />
      <div style={{ paddingTop: '160px', paddingBottom: '120px', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} className="section-container">
        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-gold)', letterSpacing: '0.2em', marginBottom: '16px', fontFamily: 'var(--font-accent)' }}>404 ERROR</span>
        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', color: 'var(--color-charcoal)', marginBottom: '24px', lineHeight: '1.1', fontFamily: 'var(--font-heading)' }}>
          PAGE NOT FOUND.
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-muted)', maxWidth: '500px', marginBottom: '40px', lineHeight: '1.6' }}>
          The page you are looking for might have been moved, renamed, or is temporarily unavailable.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" className="pill-button pill-button-burgundy">
            RETURN HOME <ArrowRight size={18} />
          </a>
          <a href="/rooms" className="pill-button pill-button-white" style={{ border: '1px solid rgba(197, 161, 90, 0.3)' }}>
            EXPLORE SIX ROOMS
          </a>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;
