import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaPhone, FaMapMarkerAlt,
  FaUniversity, FaTrain, FaStickyNote,
  FaCheckCircle, FaShoppingCart, FaGift, FaTag, FaMoneyBillWave
} from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useCart } from '../CartContext';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { localizedProductTitle } from '../utils/localization';
import { CAIRO_METRO_LINES } from '../data/cairoMetroStations';
import englishStationLabels from '../data/cairoMetroStations.en.json';
import { buildOrderNotes } from '../utils/orderCustomization';

// ── Delivery options ─────────────────────────────────────────────────────────
const FREE_METRO_STATIONS = new Set(['حلمية الزيتون', 'حدائق الزيتون']);

function getMetroStationName(value) {
  return String(value || '').split(' — ')[0].trim();
}

function getDeliveryFee(method, station) {
  if (method === 'obour_institutes' || method === 'obour_university') return 0;
  if (method === 'metro_station' && FREE_METRO_STATIONS.has(getMetroStationName(station))) return 0;
  return 50;
}

const DELIVERY_OPTIONS = [
  {
    value: 'metro_station',
    label: 'Nearest metro station',
    labelAr: 'أقرب محطة مترو',
    description: 'Most stations are EGP 50; Helmeyet and Hadayek El-Zaitoun are free',
    descriptionAr: '٥٠ جنيهًا لمعظم المحطات؛ حلمية الزيتون وحدائق الزيتون مجانًا',
    sublabel: 'Fee by station',
    sublabelAr: 'الرسوم حسب المحطة',
    icon: <FaTrain />,
  },
  {
    value: 'obour_institutes',
    label: 'Obour institutes',
    labelAr: 'معاهد العبور',
    description: 'Free pickup from the institutes',
    descriptionAr: 'استلام مجاني من المعاهد',
    sublabel: 'FREE',
    sublabelAr: 'مجاني',
    feeType: 'free',
    icon: <FaUniversity />,
  },
  {
    value: 'obour_university',
    label: 'Obour University',
    labelAr: 'جامعة العبور',
    description: 'Free pickup from the university',
    descriptionAr: 'استلام مجاني من الجامعة',
    sublabel: 'FREE',
    sublabelAr: 'مجاني',
    feeType: 'free',
    icon: <FaUniversity />,
  },
  {
    value: 'helwan_university',
    label: 'Helwan University',
    labelAr: 'جامعة حلوان',
    description: 'Pickup from the university — EGP 50',
    descriptionAr: 'استلام من الجامعة — ٥٠ جنيهًا',
    sublabel: '+EGP 50',
    sublabelAr: '+٥٠ جنيه',
    feeType: 'paid',
    icon: <FaUniversity />,
  },
  {
    value: 'ain_shams_university',
    label: 'Ain Shams University',
    labelAr: 'جامعة عين شمس',
    description: 'Pickup from the university — EGP 50',
    descriptionAr: 'استلام من الجامعة — ٥٠ جنيهًا',
    sublabel: '+EGP 50',
    sublabelAr: '+٥٠ جنيه',
    feeType: 'paid',
    icon: <FaUniversity />,
  },
];

const DEFAULT_DELIVERY = 'obour_institutes';
function getOrderItems(cart) {
  return cart.map(function (item) {
    return { id: item.product.id, quantity: item.quantity, ...(item.variant ? { variant: item.variant } : {}) };
  });
}
// ── Component ────────────────────────────────────────────────────────────────
function CheckoutPage() {
  const { language } = useLanguage();
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
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [error, setError]         = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const deliveryFee = getDeliveryFee(deliveryMethod, metroStation);
  const orderTotal = couponPreview?.valid ? Number(couponPreview.total_amount) : finalTotal + deliveryFee;
  const cartSignature = cart.map(function (item) { return `${item.product.id}:${item.variant || ''}:${item.quantity}:${JSON.stringify(item.customization || null)}`; }).join('|');
  const pricingContext = `${cartSignature}::${deliveryMethod}::${metroStation}::${finalTotal}`;
  const pricingContextRef = useRef(pricingContext);
  pricingContextRef.current = pricingContext;

  useEffect(function () {
    setCouponPreview(null);
    setCouponMessage('');
  }, [pricingContext]);

  // Auto-redirect to home 3 seconds after successful order
  useEffect(function () {
    if (!submitted || submittedOrder?.feedback_token) return;
    const timer = setTimeout(function () {
      navigate('/');
    }, 3000);
    return function () { clearTimeout(timer); };
  }, [submitted, submittedOrder, navigate]);

  // ── Coupon preview ──────────────────────────────────────────────────────────
  async function applyCoupon() {
    setError('');
    if (!couponCode.trim()) {
      setCouponPreview(null);
      setCouponMessage(localizedCopy(language, 'Enter a coupon code first.', 'اكتب كود الكوبون أولاً.'));
      return;
    }
    if (!supabase) {
      setCouponPreview(null);
      setCouponMessage(localizedCopy(language, 'Coupon service is not configured right now.', 'خدمة الكوبونات غير مهيأة حالياً.'));
      return;
    }
    if (deliveryMethod === 'metro_station' && !metroStation) {
      setCouponPreview(null);
      setCouponMessage(localizedCopy(language, 'Choose a metro station first to calculate the total accurately.', 'اختر محطة المترو أولاً لحساب الإجمالي بدقة.'));
      return;
    }

    const requestedPricingContext = pricingContext;
    setCouponLoading(true);
    try {
      const { data, error: couponError } = await supabase.rpc('preview_coupon', {
        p_code: couponCode.trim(),
        p_items: getOrderItems(cart),
        p_delivery_method: deliveryMethod,
        p_metro_station: deliveryMethod === 'metro_station' ? metroStation : null,
      });
      if (pricingContextRef.current !== requestedPricingContext) {
        setCouponPreview(null);
        setCouponMessage(localizedCopy(language, 'Your cart or pickup location changed. Apply the coupon again to refresh the total.', 'السلة أو مكان الاستلام اتغيّر. طبّق الكوبون مرة تانية لتحديث الإجمالي.'));
        return;
      }
      if (couponError || !data) {
        console.error('Coupon preview failed.');
        setCouponPreview(null);
        setCouponMessage(localizedCopy(language, 'Could not verify the coupon right now. Please try again.', 'تعذر التحقق من الكوبون الآن. حاول مرة أخرى.'));
        return;
      }
      if (!data.valid) {
        setCouponPreview(null);
        setCouponMessage(data.message || localizedCopy(language, 'The coupon is invalid or has reached its usage limit.', 'الكوبون غير صالح أو انتهى عدد استخداماته.'));
        return;
      }
      setCouponPreview(data);
      setCouponMessage(data.message || localizedCopy(language, 'Coupon applied successfully.', 'تم تطبيق الكوبون بنجاح.'));
    } catch (_couponError) {
      setCouponPreview(null);
      setCouponMessage(localizedCopy(language, 'Could not connect to the coupon service. Please try again.', 'تعذر الاتصال بخدمة الكوبونات. حاول مرة أخرى.'));
    } finally {
      setCouponLoading(false);
    }
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    if (!name.trim())  return localizedCopy(language, 'Please enter your name.', 'من فضلك ادخل اسمك.');
    if (!phone.trim()) return localizedCopy(language, 'Please enter your phone number.', 'من فضلك ادخل رقم الهاتف.');
    if (!/^01[0-9]{9}$/.test(phone.trim()))
      return localizedCopy(language, 'Enter a valid Egyptian mobile number (01XXXXXXXXX).', 'ادخل رقم موبايل مصري صحيح (01XXXXXXXXX).');
    if (cart.length === 0) return localizedCopy(language, 'Your cart is empty!', 'السلة فارغة!');
    if (deliveryMethod === 'metro_station' && !metroStation)
      return localizedCopy(language, 'Please choose your nearest metro station.', 'من فضلك اختر أقرب محطة مترو لك.');
    if (couponCode.trim() && !couponPreview?.valid)
      return localizedCopy(language, 'Apply the coupon and confirm it is valid before placing the order.', 'اضغط على «تطبيق الكوبون» وتأكد من صلاحيته قبل تأكيد الطلب.');
    return null;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    if (!supabase) {
      setError(localizedCopy(language, 'Order service is not configured right now. Please try again later.', 'خدمة تسجيل الطلب غير مهيأة حالياً. حاول مرة أخرى لاحقاً.'));
      return;
    }

    setLoading(true);

    try {
      const { data: orderResult, error: supabaseError } = await supabase.rpc('submit_order', {
        p_customer_name: name.trim(),
        p_phone: phone.trim(),
        p_delivery_method: deliveryMethod,
        p_metro_station: deliveryMethod === 'metro_station' ? metroStation : null,
        p_notes: buildOrderNotes(notes, cart),
        p_items: getOrderItems(cart),
        p_coupon_code: couponPreview?.valid ? couponCode.trim() : null,
      });

      if (supabaseError || !orderResult?.order_id) {
        console.error('Order submission failed.');
        if (supabaseError?.message?.includes('COUPON_INVALID')) {
          setCouponPreview(null);
          setCouponMessage(localizedCopy(language, 'The coupon has reached its usage limit or is no longer valid. Try another code.', 'انتهى عدد استخدام الكوبون أو لم يعد صالحاً. جرّب كوداً آخر.'));
          setError(localizedCopy(language, 'The order was not placed because the coupon is no longer available.', 'لم يتم تسجيل الطلب لأن الكوبون لم يعد متاحاً.'));
          return;
        }
        setError(localizedCopy(language, 'There was an error placing the order. Please try again shortly.', 'حصل خطأ أثناء تسجيل الطلب. حاول مرة أخرى بعد قليل.'));
        return;
      }

      setSubmittedTotal(Number(orderResult.total_amount));
      setSubmittedFreeItems(Number(orderResult.free_items) || 0);
      setSubmittedOrder(orderResult);
      if (orderResult.feedback_token) {
        try { window.sessionStorage.setItem('laz2a_feedback_token', String(orderResult.feedback_token)); } catch (_storageError) { /* The confirmation link still works without session storage. */ }
      }
      clearCart();
      setSubmitted(true);
    } catch (_submitError) {
      setError(localizedCopy(language, 'Could not connect to the order service. Check your internet connection and try again.', 'تعذر الاتصال بخدمة الطلبات. تحقق من الإنترنت وحاول مرة أخرى.'));
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
              <h2 className="success-title">{localizedCopy(language, 'Your order was placed successfully!', 'تم تسجيل طلبك بنجاح!')}</h2>

              <Alert className="success-alert-box">
                {localizedCopy(language, "We'll contact you shortly at", 'هنتواصل معاك قريباً على')}{' '}
                <strong style={{ direction: 'ltr', display: 'inline-block' }}>
                  {phone}
                </strong>
                {' '}{localizedCopy(language, 'to confirm your order', 'لتأكيد الطلب')} <FaCheckCircle style={{ marginRight: '5px' }} />
              </Alert>

              <p className="success-text">
                {localizedCopy(language, 'Pickup method:', 'طريقة الاستلام:')}{' '}
                <strong>{selectedDelivery ? localizedCopy(language, selectedDelivery.label, selectedDelivery.labelAr) : ''}</strong>
                {deliveryMethod === 'metro_station' && <strong> — {metroStation}</strong>}
              </p>
              <p className="success-text">{localizedCopy(language, 'Delivery fee:', 'رسوم التوصيل:')} {Number(submittedOrder?.delivery_fee || 0) > 0 ? `${submittedOrder.delivery_fee} ${localizedCopy(language, 'EGP', 'جنيه')}` : localizedCopy(language, 'Free', 'مجاني')}</p>
              {submittedOrder?.coupon_code && <p className="success-text coupon-success-line">{localizedCopy(language, 'Coupon', 'كوبون')} {submittedOrder.coupon_code} ({submittedOrder.coupon_percent}%): {localizedCopy(language, 'discount', 'خصم')} {submittedOrder.coupon_discount_amount} {localizedCopy(language, 'EGP', 'جنيه')}</p>}
              <p className="success-text">{localizedCopy(language, 'Total:', 'الإجمالي:')} {submittedTotal ?? orderTotal} {localizedCopy(language, 'EGP', 'جنيه')}</p>

              {submittedOrder?.feedback_token && (
                <div className="success-feedback-invite">
                  <p>{localizedCopy(language, 'Bought from Laz2a? Share a review tied to this order.', 'اشتريت من Laz2a؟ شارك رأيك المرتبط بطلبك.')}</p>
                  <Link className="verified-feedback-cta" to={`/feedback?token=${encodeURIComponent(submittedOrder.feedback_token)}`}>
                    {localizedCopy(language, 'Share your feedback', 'شارك رأيك بعد الشراء')}
                  </Link>
                </div>
              )}

              {submittedFreeItems > 0 && (
                <div className="free-stickers-alert">
                  <FaGift style={{ marginLeft: '5px' }} />
                  {localizedCopy(language, "Don't forget — you have", 'ما تنساش — عندك')}{' '}
                  <strong>{submittedFreeItems} {localizedCopy(language, 'free stickers!', 'استيكر مجاناً!')}</strong>
                </div>
              )}

              <p className="redirect-note">
                {localizedCopy(language, 'You will be redirected to the home page in a few seconds…', 'هيتم تحويلك للصفحة الرئيسية خلال ثوانٍ…')}
              </p>

              <Button className="btn btn-metallic-gold mt-2 py-2 px-4" onClick={function () { navigate('/'); }}>
                {localizedCopy(language, 'Back to shop now', 'ارجع للمتجر الآن')}
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
            <p style={{ color: 'var(--text-secondary)' }}>{localizedCopy(language, 'Your cart is empty.', 'السلة فارغة.')}</p>
            <Button className="btn btn-metallic-gold mt-3 px-5 py-2" onClick={function () { navigate('/'); }}>
              {localizedCopy(language, 'Shop now', 'تسوق دلوقتي')}
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
          <h2 className="checkout-title">{localizedCopy(language, 'Checkout', 'إتمام الطلب')}</h2>
          {cart.some((item) => item.variant) && (
            <div className="checkout-variant-summary">
              <strong>{localizedCopy(language, 'Selected colors', 'الألوان المختارة')}</strong>
              {cart.filter((item) => item.variant).map((item) => {
                const variant = (item.product.color_variants || []).find((option) => option.value === item.variant);
                return (
                  <span key={`${item.product.id}:${item.variant}`}>
                    {localizedProductTitle(item.product, language)} — {localizedCopy(language, variant?.label_en || item.variant, variant?.label_ar || item.variant)} × {item.quantity}
                  </span>
                );
              })}
            </div>
          )}
          {cart.some((item) => item.customization) && (
            <div className="checkout-variant-summary checkout-customization-summary">
              <strong>{localizedCopy(language, 'Personalized label text', 'نص الليبلات المخصصة')}</strong>
              {cart.filter((item) => item.customization).map((item, index) => {
                const customization = item.customization;
                const text = customization.text || [customization.fields?.name, customization.fields?.className].filter(Boolean).join('\n');
                return (
                  <span key={`${item.product.id}:${customization.designId || index}:${index}`}>
                    {localizedProductTitle(item.product, language)} — {language === 'ar' ? customization.designTitleAr : customization.designTitleEn} × {item.quantity}
                    <br />{text}
                  </span>
                );
              })}
            </div>
          )}

          {/* Order items summary — what the customer is about to order */}
          <div className="checkout-items-summary" style={{ marginBottom: '1.25rem' }}>
            <strong>{localizedCopy(language, 'Your order', 'طلبك')}</strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0' }}>
              {cart.map((item) => (
                <li
                  key={`${item.product.id}:${item.variant || ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', padding: '0.35rem 0', borderBottom: '1px solid #222' }}
                >
                  <span>
                    {localizedProductTitle(item.product, language)}
                    {item.variant ? ` — ${item.variant}` : ''} × {item.quantity}
                  </span>
                  <strong>{Number(item.product.base_price ?? item.product.price ?? 10) * item.quantity} {localizedCopy(language, 'EGP', 'جنيه')}</strong>
                </li>
              ))}
            </ul>
          </div>

          <div className="checkout-subtitle" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span>{localizedCopy(language, 'Original subtotal:', 'المجموع الأصلي:')} {subtotal} {localizedCopy(language, 'EGP', 'جنيه')}</span>
            {discountAmount > 0 && (
              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
                {localizedCopy(language, 'Discount:', 'خصم:')} -{discountAmount} {localizedCopy(language, 'EGP', 'جنيه')}
              </span>
            )}
            {couponPreview?.valid && (
              <span className="coupon-discount-summary">
                {localizedCopy(language, 'Coupon discount', 'خصم الكوبون')} ({couponPreview.coupon_percent}%): -{couponPreview.coupon_discount_amount} {localizedCopy(language, 'EGP', 'جنيه')}
              </span>
            )}
            <span style={{ color: 'var(--text-secondary)' }}>
              {localizedCopy(language, 'Delivery fee:', 'رسوم التوصيل:')} {deliveryFee > 0 ? `+${deliveryFee} ${localizedCopy(language, 'EGP', 'جنيه')}` : localizedCopy(language, 'Free', 'مجاني')}
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-gold)', marginTop: '5px' }}>
              {localizedCopy(language, 'Total:', 'الإجمالي:')} {orderTotal} {localizedCopy(language, 'EGP', 'جنيه')}
            </span>
          </div>

          {/* Free sticker reminder */}
          {freeItems > 0 && (
            <div className="free-stickers-alert" style={{ marginBottom: '1.25rem' }}>
              <FaGift style={{ marginLeft: '6px' }} />
              {localizedCopy(language, 'You earned', 'كسبت')} <strong>{freeItems} {localizedCopy(language, 'free stickers!', 'استيكر مجاناً!')}</strong>
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
                <FaUser className="label-icon" /> {localizedCopy(language, 'Name', 'الاسم')}
              </Form.Label>
              <Form.Control
                type="text"
                placeholder={localizedCopy(language, 'Ahmed Mohamed', 'أحمد محمد')}
                className="form-ctrl"
                value={name}
                onChange={function (e) { setName(e.target.value); }}
                disabled={loading}
              />
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">
                <FaPhone className="label-icon" /> {localizedCopy(language, 'Phone number', 'رقم الهاتف')}
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

            {/* Coupon code is previewed by the database and revalidated atomically at order submission. */}
            <Form.Group className="mb-3 coupon-form-group">
              <Form.Label className="form-label-dark">
                <FaTag className="label-icon" /> {localizedCopy(language, 'Coupon code', 'كود الخصم')}
              </Form.Label>
              <div className="coupon-input-row">
                <Form.Control
                  type="text"
                  className="form-ctrl coupon-code-input"
                  placeholder={localizedCopy(language, 'Enter coupon code', 'اكتب الكوبون')}
                  value={couponCode}
                  maxLength={32}
                  autoComplete="off"
                  dir="ltr"
                  onChange={function (e) {
                    setCouponCode(e.target.value);
                    setCouponPreview(null);
                    setCouponMessage('');
                  }}
                  disabled={loading || couponLoading}
                />
                <Button type="button" className="btn btn-metallic-gold coupon-apply-button" onClick={applyCoupon} disabled={loading || couponLoading}>
                  {couponLoading ? localizedCopy(language, 'Checking…', 'جارٍ التحقق…') : localizedCopy(language, 'Apply', 'تطبيق')}
                </Button>
              </div>
              {couponMessage && (
                <div className={'coupon-message' + (couponPreview?.valid ? ' coupon-message--success' : ' coupon-message--error')} role="status">
                  {couponMessage}
                </div>
              )}
            </Form.Group>

            {/* Delivery Method */}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-dark">
                <FaMapMarkerAlt className="label-icon" /> {localizedCopy(language, 'Delivery / pickup option', 'طريقة التوصيل أو الاستلام')}
              </Form.Label>
              <p className="delivery-pricing-note">{localizedCopy(language, 'EGP 50 for all options except Obour University, Obour Institutes, and the two marked Zaitoun metro stations.', 'رسوم ٥٠ جنيهًا لكل الاختيارات ما عدا جامعة ومعاهد العبور ومحطتي مترو الزيتون الموضحتين مجانًا.')}</p>
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
                        <span className="delivery-option-label">{localizedCopy(language, option.label, option.labelAr)}</span>
                        <small className="delivery-option-description">{localizedCopy(language, option.description, option.descriptionAr)}</small>
                      </span>
                      {option.sublabel && <span className={'delivery-fee-badge' + (option.feeType ? ` delivery-fee-badge--${option.feeType}` : '')}>{localizedCopy(language, option.sublabel, option.sublabelAr)}</span>}
                    </label>
                  );
                })}
              </div>
            </Form.Group>

            {deliveryMethod === 'metro_station' && (
              <Form.Group className="mb-3 metro-station-field">
                <Form.Label className="form-label-dark"><FaTrain className="label-icon" /> {localizedCopy(language, 'Nearest metro station', 'أقرب محطة مترو')}</Form.Label>
                <Form.Select
                  className="form-ctrl metro-station-select"
                  value={metroStation}
                  onChange={function (e) { setMetroStation(e.target.value); }}
                  disabled={loading}
                  required
                >
                  <option value="">{localizedCopy(language, 'Choose your nearest station', 'اختر المحطة الأقرب إليك')}</option>
                  {CAIRO_METRO_LINES.map(function (line) {
                    return (
                      <optgroup key={line.name} label={language === 'en' ? (englishStationLabels[line.name] || line.name) : line.name}>
                        {line.stations.map(function (station) {
                          const stationWithLine = `${station} — ${line.label}`;
                          const stationLabel = language === 'en'
                            ? `${englishStationLabels[station] || station} — ${englishStationLabels[line.label] || line.label}`
                            : stationWithLine;
                          const stationFee = FREE_METRO_STATIONS.has(station)
                            ? localizedCopy(language, ' — FREE', ' — مجانًا')
                            : localizedCopy(language, ' — +EGP 50', ' — +٥٠ جنيه');
                          return <option key={`${line.name}-${station}`} value={stationWithLine}>{stationLabel}{stationFee}</option>;
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
                <FaStickyNote className="label-icon" /> {localizedCopy(language, 'Additional notes (optional)', 'ملاحظات إضافية (اختياري)')}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={localizedCopy(language, 'Any special requests…', 'أي طلبات خاصة…')}
                className="form-ctrl"
                value={notes}
                onChange={function (e) { setNotes(e.target.value); }}
                disabled={loading}
              />
            </Form.Group>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              <FaMoneyBillWave style={{ marginLeft: '5px' }} />
              {localizedCopy(language, 'Payment is cash on pickup.', 'الدفع نقدًا عند الاستلام.')}
            </p>

            <Button
              type="submit"
              className="btn btn-metallic-gold w-100 py-3 fs-5"
              disabled={loading || couponLoading}
            >
              {loading
                ? localizedCopy(language, 'Placing order…', 'جاري تسجيل الطلب...')
                : `${localizedCopy(language, 'Place order —', 'تأكيد الطلب —')} ${orderTotal} ${localizedCopy(language, 'EGP', 'جنيه')}`
              }
            </Button>
          </Form>
        </div>
      </Container>
    </div>
  );
}

export default CheckoutPage;
