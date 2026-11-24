import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaGift } from 'react-icons/fa';
import { localizedCopy, useLanguage } from '../LanguageContext';

export default function OffersModal() {
  const [show, setShow] = useState(false);
  const { language } = useLanguage();
  const t = (english, arabic) => localizedCopy(language, english, arabic);

  useEffect(() => {
    // Small delay for better UX
    const timer = setTimeout(() => {
      setShow(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Modal dir={language === 'ar' ? 'rtl' : 'ltr'} show={show} onHide={() => setShow(false)} centered contentClassName="border-metallic">
      <Modal.Header className="cart-modal-header offers-modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Modal.Title style={{ color: 'var(--color-gold)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaGift /> {t('New laz2a offers!', 'عروض لازقة الجديدة!')}
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white offers-modal-close"
          aria-label={t('Close offers window', 'إغلاق نافذة العروض')}
          title={t('Close', 'إغلاق')}
          onClick={() => setShow(false)}
        />
      </Modal.Header>
      
      <Modal.Body style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          {t('Choose your individual stickers and enjoy the biggest automatic discounts in your cart:', 'اختار استيكراتك الفردية واستمتع بأقوى الخصومات التلقائية في السلة:')}
        </p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li className="offer-tier-item">🎁 {t(<>Add <strong>12</strong> stickers to your cart (pay for 10 and get <strong>2 free</strong>)</>, <>حط <strong>12</strong> استيكر في السلة (ادفع تمن 10 وخد <strong>2 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item">🎁 {t(<>Add <strong>25</strong> stickers to your cart (pay for 20 and get <strong>5 free</strong>)</>, <>حط <strong>25</strong> استيكر في السلة (ادفع تمن 20 وخد <strong>5 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item">🎁 {t(<>Add <strong>40</strong> stickers to your cart (pay for 30 and get <strong>10 free</strong>)</>, <>حط <strong>40</strong> استيكر في السلة (ادفع تمن 30 وخد <strong>10 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item">🎁 {t(<>Add <strong>55</strong> stickers to your cart (pay for 40 and get <strong>15 free</strong>)</>, <>حط <strong>55</strong> استيكر في السلة (ادفع تمن 40 وخد <strong>15 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item">🎁 {t(<>Add <strong>70</strong> stickers to your cart (pay for 50 and get <strong>20 free</strong>)</>, <>حط <strong>70</strong> استيكر في السلة (ادفع تمن 50 وخد <strong>20 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item" style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>🔥 {t(<>Add <strong>110</strong> stickers to your cart (pay for 75 and get <strong>35 free</strong>)</>, <>حط <strong>110</strong> استيكر في السلة (ادفع تمن 75 وخد <strong>35 مجاناً</strong>)</>)}</li>
          <li className="offer-tier-item" style={{ color: '#4CAF50', fontSize: '1.3rem', fontWeight: 900 }}>🚀 {t(<>Add <strong>155</strong> stickers to your cart (pay for 100 and get <strong>55 free!</strong>)</>, <>حط <strong>155</strong> استيكر في السلة (ادفع تمن 100 وخد <strong>55 مجاناً!</strong>)</>)}</li>
        </ul>

        <div className="mt-4" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t('* Ready-made collections have a special price and are not counted toward individual sticker offers.', '* الكوليكشنات الجاهزة ليها سعر خاص ومابتتحسبش ضمن العدد الفردي للعروض.')}
        </div>
      </Modal.Body>
      
      <Modal.Footer className="cart-modal-footer" style={{ justifyContent: 'center' }}>
        <Button className="btn btn-metallic-gold px-5 fw-bold" onClick={() => setShow(false)}>
          {t("Let's start shopping!", 'يلا نبدأ تسوق!')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
