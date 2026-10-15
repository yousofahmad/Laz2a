import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaPhone, FaMapMarkerAlt,
  FaUniversity, FaTrain, FaStickyNote,
  FaCheckCircle, FaShoppingCart, FaGift
} from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useCart } from '../CartContext';
import { CAIRO_METRO_LINES } from '../data/cairoMetroStations';

// ── Delivery options ─────────────────────────────────────────────────────────
const DELIVERY_OPTIONS = [
  {
    value: 'metro_station',
    label: 'أقرب محطة مترو',
    description: 'اختر المحطة الأقرب إليك — ٥٠ جنيهًا',
    sublabel: '+٥٠ جنيه',
    icon: <FaTrain />,
  },
  {
    value: 'obour_institutes',
    label: 'معاهد العبور',
    description: 'استلام من المعاهد',
    icon: <FaUniversity />,
  },
  {
    value: 'obour_university',
    label: 'جامعة العبور',
    description: 'استلام من الجامعة',
    icon: <FaUniversity />,
  },
  {
    value: 'helwan_university',
    label: 'جامعة حلوان',
    description: 'استلام من الجامعة',
    icon: <FaUniversity />,
  },
  {
    value: 'ain_shams_university',
    label: 'جامعة عين شمس',
    description: 'استلام من الجامعة',
    icon: <FaUniversity />,
  },
];

const DEFAULT_DELIVERY = 'obour_institutes';
const METRO_DELIVERY_FEE = 50;

// ── Component ────────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { 
    cart, clearCart,
    subtotal, discountAmount, finalTotal, freeItems
  } = useCart();
  const navigate = useNavigate();

  // Form fields
  const [name, setName]                     = useState('');
  const [phone, setPhone]                   = useState('');
  const [notes, setNotes]                   = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState(DEFAULT_DELIVERY);
  const [metroStation, setMetroStation]     = useState('');

  // UI state
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTotal, setSubmittedTotal] = useState(null);
  const [submittedFreeItems, setSubmittedFreeItems] = useState(0);
  const [error, setError]         = useState('');
  const deliveryFee = deliveryMethod === 'metro_station' ? METRO_DELIVERY_FEE : 0;
  const orderTotal = finalTotal + deliveryFee;

  // Auto-redirect to home 3 seconds after successful order
  useEffect(function () {
    if (!submitted) return;
    const timer = setTimeout(function () {
      navigate('/');
    }, 3000);
    return function () { clearTimeout(timer); };
  }, [submitted, navigate]);

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    if (!name.trim())  return 'من فضلك ادخل اسمك.';
    if (!phone.trim()) return 'من فضلك ادخل رقم الهاتف.';
    if (!/^01[0-9]{9}$/.test(phone.trim()))
      return 'ادخل رقم موبايل مصري صحيح (01XXXXXXXXX).';
    if (cart.length === 0) return 'السلة فارغة!';
    if (deliveryMethod === 'metro_station' && !metroStation)
      return 'من فضلك اختر أقرب محطة مترو لك.';
    return null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!supabase) {
      setError('خدمة تسجيل الطلب غير مهيأة حالياً. حاول مرة أخرى لاحقاً.');
      return;
    }

    setLoading(true);

    // Build the Supabase payload
    const payload = {
      customer_name:   name.trim(),
      phone:           phone.trim(),
      address:         '',
      delivery_method: deliveryMethod,
      metro_station:   deliveryMethod === 'metro_station' ? metroStation : null,
      notes:           notes.trim(),
      total_amount:    orderTotal,
      items:           cart.map(function (item) {
        return {
          id:       item.product.id,
          name:     item.product.title,
          quantity: item.quantity,
          price:    item.product.isCollection ? item.product.price * item.quantity : item.quantity * 10,
        };
      }),
    };

    try {
      const { error: supabaseError } = await supabase
        .from('orders')
        .insert([payload]);

      if (supabaseError) {
        console.error('Order submission failed.');
        setError('حصل خطأ أثناء تسجيل الطلب. حاول مرة أخرى بعد قليل.');
        return;
      }

      setSubmittedTotal(orderTotal);
      setSubmittedFreeItems(freeItems);
      clearCart();
      setSubmitted(true);
    } catch (_submitError) {
      setError('تعذر الاتصال بخدمة الطلبات. تحقق من الإنترنت وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    const selectedDelivery = DELIVERY_OPTIONS.find(function (o) {
      return o.value === deliveryMethod;
    });
    return (
      <div className="checkout-page">
        <Container>
          <div className="checkout-card">
            <div className="success-box">
              <FaCheckCircle
                style={{ fontSize: '3.5rem', color: 'var(--color-gold)', marginBottom: '1rem' }}
              />
              <h2 className="success-title">تم تسجيل طلبك بنجاح!</h2>

              <Alert className="success-alert-box">
                هنتواصل معاك قريباً على{' '}
                <strong style={{ direction: 'ltr', display: 'inline-block' }}>
                  {phone}
                </strong>
                {' '}لتأكيد الطلب <FaCheckCircle style={{ marginRight: '5px' }} />
              </Alert>

              <p className="success-text">
                طريقة الاستلام:{' '}
                <strong>{selectedDelivery ? selectedDelivery.label : ''}</strong>
                {deliveryMethod === 'metro_station' && <strong> — {metroStation}</strong>}
              </p>
              {deliveryFee > 0 && <p className="success-text">رسوم الاستلام من المترو: {deliveryFee} جنيه</p>}
              <p className="success-text">الإجمالي: {submittedTotal ?? orderTotal} جنيه</p>

              {submittedFreeItems > 0 && (
                <div className="free-stickers-alert">
                  <FaGift style={{ marginLeft: '5px' }} />
                  ما تنساش — عندك{' '}
                  <strong>{submittedFreeItems} استيكر مجاناً!</strong>
                </div>
              )}

              <p className="redirect-note">
                هيتم تحويلك للصفحة الرئيسية خلال ثوانٍ…
              </p>

              <Button className="btn btn-metallic-gold mt-2 py-2 px-4" onClick={function () { navigate('/'); }}>
                ارجع للمتجر الآن
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ── Empty cart guard ────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Container>
          <div className="checkout-card border-metallic" style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <FaShoppingCart style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>السلة فارغة.</p>
            <Button className="btn btn-metallic-gold mt-3 px-5 py-2" onClick={function () { navigate('/'); }}>
              تسوق دلوقتي
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // ── Checkout form ───────────────────────────────────────────────────────────
  return (
    <div className="checkout-page">
      <Container>
        <div className="checkout-card border-metallic">
          <h2 className="checkout-title">إتمام الطلب</h2>
          
          <div className="checkout-subtitle" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span>المجموع الأصلي: {subtotal} جنيه</span>
            {discountAmount > 0 && (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                خصم: -{discountAmount} جنيه
              </span>
            )}
            {deliveryFee > 0 && (
              <span style={{ color: 'var(--text-secondary)' }}>
                رسوم الاستلام من المترو: +{deliveryFee} جنيه
              </span>
            )}
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-gold)', marginTop: '5px' }}>
              الإجمالي: {orderTotal} جنيه
            </span>
          </div>

          {/* Free sticker reminder */}
          {freeItems > 0 && (
            <div className="free-stickers-alert" style={{ marginBottom: '1.25rem' }}>
              <FaGift style={{ marginLeft: '6px' }} />
              كسبت <strong>{freeItems} استيكر مجاناً!</strong>
            </div>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="danger" style={{ fontSize: '0.85rem' }}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">
                <FaUser className="label-icon" /> الاسم
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="أحمد محمد"
                className="form-ctrl"
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                disabled={loading}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">
                <FaPhone className="label-icon" /> رقم الهاتف
              </Form.Label>
              <Form.Control
                type="tel"
                placeholder="01XXXXXXXXX"
                className="form-ctrl"
                value={phone}
                onChange={function (e) { setPhone(e.target.value); }}
                style={{ direction: 'ltr', textAlign: 'left' }}
                disabled={loading}
              />
            </Form.Group>

            {/* Delivery Method */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">
                <FaMapMarkerAlt className="label-icon" /> مكان الاستلام
              </Form.Label>
              <div className="delivery-options">
                {DELIVERY_OPTIONS.map(function (option) {
                  return (
                    <label
                      key={option.value}
                        className={
                          'delivery-option' +
                          (deliveryMethod === option.value ? ' delivery-option--selected' : '')
                        }
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.value}
                        checked={deliveryMethod === option.value}
                        disabled={loading}
                        onChange={function () {
                          setDeliveryMethod(option.value);
                        }}
                        style={{ marginLeft: '10px' }}
                      />
                      <span className="delivery-option-icon">{option.icon}</span>
                      <span className="delivery-option-copy">
                        <span className="delivery-option-label">{option.label}</span>
                        <small className="delivery-option-description">{option.description}</small>
                      </span>
                      {option.sublabel && <span className="delivery-fee-badge">{option.sublabel}</span>}
                    </label>
                  );
                })}
              </div>
            </Form.Group>

            {deliveryMethod === 'metro_station' && (
              <Form.Group className="mb-3 metro-station-field">
                <Form.Label className="form-label-dark"><FaTrain className="label-icon" /> أقرب محطة مترو</Form.Label>
                <Form.Select
                  className="form-ctrl metro-station-select"
                  value={metroStation}
                  onChange={function (e) { setMetroStation(e.target.value); }}
                  disabled={loading}
                  required
                >
                  <option value="">اختر المحطة الأقرب إليك</option>
                  {CAIRO_METRO_LINES.map(function (line) {
                    return (
                      <optgroup key={line.name} label={line.name}>
                        {line.stations.map(function (station) {
                          const stationWithLine = `${station} — ${line.label}`;
                          return <option key={`${line.name}-${station}`} value={stationWithLine}>{stationWithLine}</option>;
                        })}
                      </optgroup>
                    );
                  })}
                </Form.Select>
              </Form.Group>
            )}

            {/* Notes */}
            <Form.Group className="mb-4">
              <Form.Label className="form-label-dark">
                <FaStickyNote className="label-icon" /> ملاحظات إضافية (اختياري)
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="أي طلبات خاصة…"
                className="form-ctrl"
                value={notes}
                onChange={function (e) { setNotes(e.target.value); }}
                disabled={loading}
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn btn-metallic-gold w-100 py-3 fs-5"
              disabled={loading}
            >
              {loading
                ? 'جاري تسجيل الطلب...'
                : `تأكيد الطلب — ${orderTotal} جنيه`
              }
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default CheckoutPage;
