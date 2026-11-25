import React from 'react';
import { FaFire } from 'react-icons/fa';
import { localizedCopy, useLanguage } from '../LanguageContext';

// One fixed offer everywhere, matching the top promo tier:
// buy 100 stickers, get 55 free. (Previously this bar rotated
// between 4 different offers every 4.5s, which read as
// contradictory offers changing on every load.)
export default function AnnouncementBar() {
  const { language } = useLanguage();

  return (
    <div className="announcement-bar">
      <div className="announcement-content">
        <span className="announcement-icon"><FaFire /></span>
        <span className="announcement-text">
          {localizedCopy(
            language,
            'New offer: Buy 100 stickers and get 55 free!',
            'عرض جديد: اشتري 100 استيكر وخد 55 مجاناً!'
          )}
        </span>
      </div>
    </div>
  );
}
