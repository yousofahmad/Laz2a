import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLanguage, localizedCopy } from '../LanguageContext';
import './SuccessPage.css';

/**
 * SuccessPage — shown after a successful order submission.
 */
export default function SuccessPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1 className="success-title">{localizedCopy(language, 'Order Placed!', 'تم تسجيل الطلب!')}</h1>
        <p className="success-msg">
          {localizedCopy(language, "Your stickers are on their way. We'll contact you shortly to confirm your order.", 'الاستيكرز بتاعتك في الطريق. هنتواصل معاك قريباً لتأكيد طلبك.')}
        </p>
        <p className="success-sub">{localizedCopy(language, 'Thank you for your order! 🙌', 'شكراً على طلبك! 🙌')}</p>
        <Button variant="warning" className="success-btn" onClick={() => navigate('/')}>
          {localizedCopy(language, 'Back to Shop', 'العودة للمتجر')}
        </Button>
      </div>
    </div>
  );
}
