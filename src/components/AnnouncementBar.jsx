import React, { useState, useEffect } from 'react';
import { FaStar, FaGift, FaFire, FaBolt } from 'react-icons/fa';

const OFFERS = [
  { icon: <FaFire />, text: "عروض جديدة: اشتري 100 استيكر وخد 55 مجاناً!" },
  { icon: <FaBolt />, text: "أقوى عرض: اشتري 75 استيكر وخد 35 مجاناً!" },
  { icon: <FaGift />, text: "اشتري 50 استيكر وخد 20 مجاناً!" },
  { icon: <FaStar />, text: "عرض البداية: اشتري 10 استيكرات وخد 2 مجاناً!" },
];

export default function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % OFFERS.length);
    }, 4500); // Change every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="announcement-bar">
      <div className="announcement-content" key={currentIndex}>
        <span className="announcement-icon">{OFFERS[currentIndex].icon}</span>
        <span className="announcement-text">{OFFERS[currentIndex].text}</span>
      </div>
    </div>
  );
}
