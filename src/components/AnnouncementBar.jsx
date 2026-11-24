import React, { useState, useEffect } from 'react';
import { FaStar, FaGift, FaFire, FaBolt } from 'react-icons/fa';
import { localizedCopy, useLanguage } from '../LanguageContext';

const OFFERS = [
  { icon: <FaFire />, english: 'New offer: Buy 100 stickers and get 55 free!', arabic: 'عروض جديدة: اشتري 100 استيكر وخد 55 مجاناً!' },
  { icon: <FaBolt />, english: 'Biggest deal: Buy 75 stickers and get 35 free!', arabic: 'أقوى عرض: اشتري 75 استيكر وخد 35 مجاناً!' },
  { icon: <FaGift />, english: 'Buy 50 stickers and get 20 free!', arabic: 'اشتري 50 استيكر وخد 20 مجاناً!' },
  { icon: <FaStar />, english: 'Welcome offer: Buy 10 stickers and get 2 free!', arabic: 'عرض البداية: اشتري 10 استيكرات وخد 2 مجاناً!' },
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4500); // Change every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  const offer = OFFERS[currentIndex];

  return (
    <div className="announcement-bar">
      <div className="announcement-content" key={currentIndex}>
        <span className="announcement-icon">{offer.icon}</span>
        <span className="announcement-text">{localizedCopy(language, offer.english, offer.arabic)}</span>
      </div>
    </div>
  );
}
