import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './SuccessPage.css';

/**
 * SuccessPage — shown after a successful order submission.
 */
export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="success-page">
      <div className="success-card">
        <div className="success-icon">🎉</div>
        <h1 className="success-title">Order Placed!</h1>
        <p className="success-msg">
          Your stickers are on their way. We'll contact you shortly to confirm your order.
        </p>
        <p className="success-sub">شكراً على طلبك! 🙌</p>
        <Button variant="warning" className="success-btn" onClick={() => navigate('/')}>
          Back to Shop
        </Button>
      </div>
    </div>
  );
}
