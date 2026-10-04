import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaGift, FaTimes } from 'react-icons/fa';

export default function OffersModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('laz2a_offers_seen');
    if (!seen) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem('laz2a_offers_seen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Modal show={show} onHide={() => setShow(false)} centered contentClassName="border-metallic">
      <Modal.Header className="cart-modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <Modal.Title style={{ color: 'var(--color-gold)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaGift /> عروض لازقة الجديدة!
        </Modal.Title>
        <button className="btn-close btn-close-white" onClick={() => setShow(false)}></button>
      </Modal.Header>
      
      <Modal.Body style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          اختار استيكراتك الفردية واستمتع بأقوى الخصومات التلقائية في السلة:
        </p>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <li className="offer-tier-item">🎁 اشتري <strong>10</strong> استيكرات + <strong>2 مجاناً</strong></li>
          <li className="offer-tier-item">🎁 اشتري <strong>20</strong> استيكر + <strong>5 مجاناً</strong></li>
          <li className="offer-tier-item">🎁 اشتري <strong>30</strong> استيكر + <strong>10 مجاناً</strong></li>
          <li className="offer-tier-item">🎁 اشتري <strong>40</strong> استيكر + <strong>15 مجاناً</strong></li>
          <li className="offer-tier-item">🎁 اشتري <strong>50</strong> استيكر + <strong>20 مجاناً</strong></li>
          <li className="offer-tier-item" style={{ color: 'var(--color-gold)', fontSize: '1.2rem' }}>🔥 اشتري <strong>75</strong> استيكر + <strong>35 مجاناً</strong></li>
          <li className="offer-tier-item" style={{ color: '#4CAF50', fontSize: '1.3rem', fontWeight: 900 }}>🚀 اشتري <strong>100</strong> استيكر + <strong>55 مجاناً!</strong></li>
        </ul>

        <div className="mt-4" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          * الكوليكشنات الجاهزة ليها سعر خاص ومابتتحسبش ضمن العدد الفردي للعروض.
        </div>
      </Modal.Body>
      
      <Modal.Footer className="cart-modal-footer" style={{ justifyContent: 'center' }}>
        <Button className="btn btn-metallic-gold px-5 fw-bold" onClick={() => setShow(false)}>
          يلا نبدأ تسوق!
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
