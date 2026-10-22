import React, { createContext, useContext, useState, useEffect } from 'react';

const BookingContext = createContext({
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {}
});

export const useBookingModal = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <BookingContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </BookingContext.Provider>
  );
};
