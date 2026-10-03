import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaUser, FaPhone, FaMapMarkerAlt,
  FaUniversity, FaTrain, FaStickyNote,
  FaTruck, FaCheckCircle, FaShoppingCart, FaGift
} from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useCart } from '../CartContext';

// ── Delivery options ─────────────────────────────────────────────────────────
const DELIVERY_OPTIONS = [
  {
    value: 'ship_home',
    label: 'شحن للمنزل',
    sublabel: 'قريباً',
    icon: <FaTruck />,
    disabled: true,
  },
  {
    value: 'obour_pickup',
    label: 'استلام من معاهد العبور أو جامعة العبور',
    icon: <FaUniversity />,
    disabled: false,
  },
  {
    value: 'metro_zaytoun',
    label: 'استلام عند محطة مترو حدائق الزيتون',
    icon: <FaTrain />,
    disabled: false,
  },
];

const DEFAULT_DELIVERY = 'obour_pickup';

// ── Component ────────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { 
    cart, totalQuantity, clearCart, 
    subtotal, discountAmount, finalTotal, freeItems, packagesCount
  } = useCart();
  const navigate = useNavigate();

  // Form fields
  const [name, setName]                     = useState('');
  const [phone, setPhone]                   = useState('');
  const [address, setAddress]               = useState('');
  const [notes, setNotes]                   = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState(DEFAULT_DELIVERY);

  // UI state
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

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
    return null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);

    // Build the Supabase payload
    const payload = {
      customer_name:   name.trim(),
      phone:           phone.trim(),
      address:         address.trim(),
      delivery_method: deliveryMethod,
      notes:           notes.trim(),
      total_amount:    finalTotal,
      discount_amount: discountAmount,
      items:           cart.map(function (item) {
        return {
          id:       item.product.id,
          name:     item.product.title,
          quantity: item.quantity,
          price:    item.quantity * 10,
        };
      }),
    };

    const { error: supabaseError } = await supabase
      .from('orders')
      .insert([payload]);

    setLoading(false);

    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      setError('حصل خطأ أثناء تسجيل الطلب: ' + supabaseError.message);
      return;
    }

    // Success!
    clearCart();
    setSubmitted(true);
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
              </p>

              {freeItems > 0 && (
                <div className="free-stickers-alert">
                  <FaGift style={{ marginLeft: '5px' }} />
                  ما تنساش — عندك{' '}
                  <strong>{freeItems} استيكر مجاناً!</strong>
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
            <span>المجموع الأصلي: {subtotal} جنيه ({totalQuantity} استيكر)</span>
            {discountAmount > 0 && (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                خصم: -{discountAmount} جنيه
              </span>
            )}
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-gold)', marginTop: '5px' }}>
              الإجمالي: {finalTotal} جنيه
            </span>
          </div>

          {/* Free sticker reminder */}
          {freeItems > 0 && (
            <div className="free-stickers-alert" style={{ marginBottom: '1.25rem' }}>
              <FaGift style={{ marginLeft: '6px' }} />
              كسبت <strong>{freeItems} استيكر مجاناً!</strong>
              <br />
              اكتب IDs الاستيكرات اللي عايزها مجاناً في خانة الملاحظات.
            </div>
          )}

          {packagesCount > 0 && (
            <div className="free-stickers-alert" style={{ marginBottom: '1.25rem', borderColor: '#4CAF50', color: '#4CAF50', background: 'rgba(76, 175, 80, 0.1)' }}>
              <strong>وفرت 75 جنيه</strong> في كل باكدج كسبته لأنك اخترت 15 استيكر من نفس الفئة!
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
                <FaMapMarkerAlt className="label-icon" /> طريقة الاستلام
              </Form.Label>
              <div className="delivery-options">
                {DELIVERY_OPTIONS.map(function (option) {
                  return (
                    <label
                      key={option.value}
                      className={
                        'delivery-option' +
                        (option.disabled ? ' delivery-option--disabled' : '') +
                        (deliveryMethod === option.value ? ' delivery-option--selected' : '')
                      }
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.value}
                        checked={deliveryMethod === option.value}
                        disabled={option.disabled || loading}
                        onChange={function () {
                          if (!option.disabled) setDeliveryMethod(option.value);
                        }}
                        style={{ marginLeft: '10px' }}
                      />
                      <span className="delivery-option-icon">{option.icon}</span>
                      <span className="delivery-option-label">{option.label}</span>
                      {option.sublabel && (
                        <span className="delivery-soon-badge">{option.sublabel}</span>
                      )}
                    </label>
                  );
                })}
              </div>
            </Form.Group>

            {/* Address — only for home delivery */}
            {deliveryMethod === 'ship_home' && (
              <Form.Group className="mb-3">
                <Form.Label className="form-label-dark">
                  <FaMapMarkerAlt className="label-icon" /> عنوان التوصيل
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="الشارع، المبنى، المدينة…"
                  className="form-ctrl"
                  value={address}
                  onChange={function (e) { setAddress(e.target.value); }}
                  disabled={loading}
                />
              </Form.Group>
            )}

            {/* Notes */}
            <Form.Group className="mb-4">
              <Form.Label className="form-label-dark">
                <FaStickyNote className="label-icon" /> ملاحظات
                {freeItems > 0 && (
                  <span style={{ color: 'var(--color-gold)' }}>
                    {' '}(اكتب هنا IDs الـ {freeItems} استيكر المجاني)
                  </span>
                )}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={
                  freeItems > 0
                    ? `مثلاً: #12، #47 (عندك ${freeItems} مجاناً)`
                    : 'أي طلبات خاصة…'
                }
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
                : `تأكيد الطلب — ${finalTotal} جنيه`
              }
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default CheckoutPage;
