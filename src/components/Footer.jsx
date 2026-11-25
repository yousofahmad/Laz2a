import React from 'react';
import { Link } from 'react-router-dom';
import { FaWhatsapp, FaMoneyBillWave, FaMapMarkerAlt, FaStore } from 'react-icons/fa';
import { localizedCopy, useLanguage } from '../LanguageContext';

const WHATSAPP_BUSINESS_PHONE = '201552323060';

export default function Footer() {
  const { language } = useLanguage();

  const whatsappMessage = localizedCopy(
    language,
    'Hello, I would like to print custom stickers',
    'أهلاً، عايز أطبع استيكرات مخصوص'
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <footer className="site-footer" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="site-footer-inner">
        <div className="site-footer-col">
          <div className="site-footer-brand">
            <img src="/logo.webp" alt="Laz2a" className="site-footer-logo" />
            <span className="site-footer-name">Laz2a</span>
          </div>
          <p className="site-footer-tagline">
            {localizedCopy(language, 'Premium stickers at the best prices and highest quality', 'استيكرات بريميوم بأفضل الأسعار وأعلى جودة')}
          </p>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-heading">
            <FaStore /> {localizedCopy(language, 'Shop', 'المتجر')}
          </h3>
          <Link to="/">{localizedCopy(language, 'All stickers', 'كل الاستيكرات')}</Link>
          <Link to="/collections">{localizedCopy(language, 'Collections', 'كوليكشنات')}</Link>
          <Link to="/checkout">{localizedCopy(language, 'Checkout', 'إتمام الطلب')}</Link>
          <Link to="/feedback">{localizedCopy(language, 'Share your feedback', 'شارك رأيك')}</Link>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-heading">
            <FaMapMarkerAlt /> {localizedCopy(language, 'Pickup & delivery', 'الاستلام والتوصيل')}
          </h3>
          <p>{localizedCopy(language, 'Obour Institutes — free', 'معاهد العبور — مجاني')}</p>
          <p>{localizedCopy(language, 'Obour University — free', 'جامعة العبور — مجاني')}</p>
          <p>{localizedCopy(language, 'Nearest metro station — EGP 50 (Helmeyet & Hadayek El-Zaitoun free)', 'أقرب محطة مترو — ٥٠ جنيهًا (حلمية وحدائق الزيتون مجانًا)')}</p>
          <p>{localizedCopy(language, 'Helwan & Ain Shams Universities — EGP 50', 'جامعة حلوان وعين شمس — ٥٠ جنيهًا')}</p>
        </div>

        <div className="site-footer-col">
          <h3 className="site-footer-heading">
            <FaMoneyBillWave /> {localizedCopy(language, 'Payment & contact', 'الدفع والتواصل')}
          </h3>
          <p>{localizedCopy(language, 'Payment is cash on pickup.', 'الدفع نقدًا عند الاستلام.')}</p>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <FaWhatsapp /> {localizedCopy(language, 'Order on WhatsApp', 'اطلب على واتساب')}
          </a>
          <p className="site-footer-note">
            {localizedCopy(language, 'Custom designs? Message us on WhatsApp.', 'عندك تصميم خاص؟ كلمنا على واتساب.')}
          </p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} Laz2a — {localizedCopy(language, 'All rights reserved.', 'كل الحقوق محفوظة.')}</span>
      </div>
    </footer>
  );
}
