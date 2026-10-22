import React from 'react';

const Link = ({ href, children, className, onClick, ...props }) => {
  const handleClick = (e) => {
    // Allow custom onClick to run first
    if (onClick) {
      onClick(e);
    }
    
    // Only intercept if it's a relative path and default wasn't prevented
    if (!e.defaultPrevented && href && href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault();
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};

export default Link;
