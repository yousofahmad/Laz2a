import React, { useState, useEffect } from 'react';
import { FaStar, FaGift, FaFire, FaBolt } from 'react-icons/fa';

const OFFERS = [
  { icon: <FaFire />, text: "عرض الكومبو: اشتري 44 استيكر وعليهم 14 مجاناً!" },
  { icon: <FaBolt />, text: "باكدج الفئة: اختار 15 استيكر من نفس الفئة بـ 75 جنيه بس!" },
  { icon: <FaGift />, text: "اشتري 29 استيكر وخد 9 مجاناً!" },
  { icon: <FaStar />, text: "عرض البداية: 14 استيكر وعليهم 4 مجاناً!" },
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
