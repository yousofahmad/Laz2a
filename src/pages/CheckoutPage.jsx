import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { supabase } from '../supabaseClient';
import { promoLabel } from '../utils/promotions';
import './CheckoutPage.css';

const INITIAL_FORM = { customer_name: '', phone: '', address: '' };

/**
 * CheckoutPage — order summary + contact form.
 * On submit: posts order to Supabase `orders` table, clears cart, redirects to /success.
 */
export default function CheckoutPage() {
  const { items, paidQty, freeQty, totalQty, totalPrice, activeTier, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm]       = useState(INITIAL_FORM);
  const [errors, setErrors]   = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Validation ────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    else if (!/^01[0-9]{9}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid Egyptian mobile number (01XXXXXXXXX).';
    if (!form.address.trim()) e.address = 'Address is required.';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (items.length === 0) {
      setSubmitError('Your cart is empty!');
      return;
    }

    setSubmitting(true);

    const payload = {
      customer_name: form.customer_name.trim(),
      phone:         form.phone.trim(),
      address:       form.address.trim(),
      total_amount:  totalPrice,
      items:         items.map((i) => ({
        id:       i.id,
        name:     i.name,
        quantity: i.quantity,
        price:    i.quantity * 10,
      })),
      // Metadata
      paid_qty:  paidQty,
      free_qty:  freeQty,
      total_qty: totalQty,
    };

    try {
      const { error } = await supabase.from('orders').insert([payload]);
      if (error) throw error;

      clearCart();
      navigate('/success');
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Empty cart guard ──────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <span className="checkout-empty__icon">🛒</span>
        <h3>Your cart is empty</h3>
        <Button variant="warning" onClick={() => navigate('/')}>
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Container>
        <h1 className="checkout-title">Checkout</h1>

        <Row className="g-4">
          {/* ── Order Summary ── */}
          <Col xs={12} lg={5} className="order-last order-lg-last">
            <div className="order-summary">
              <h5 className="summary-heading">Order Summary</h5>

              {activeTier && (
                <div className="checkout-promo-banner">{promoLabel(activeTier)}</div>
              )}

              <ul className="order-items">
                {items.map((item) => (
                  <li key={item.id} className="order-item">
                    <img src={item.image} alt={item.name} className="order-item__img" />
                    <span className="order-item__name">{item.name}</span>
                    <span className="order-item__qty">×{item.quantity}</span>
                    <span className="order-item__price">{item.quantity * 10} EGP</span>
                  </li>
                ))}
              </ul>

              <div className="order-totals">
                <div className="total-line">
                  <span>Stickers paid for</span>
                  <span>{paidQty}</span>
                </div>
                {freeQty > 0 && (
                  <div className="total-line free-line">
                    <span>🎁 Free stickers</span>
                    <span>+{freeQty}</span>
                  </div>
                )}
                <div className="total-line grand-line">
                  <span>Total received</span>
                  <span className="text-warning">{totalQty} stickers</span>
                </div>
                <div className="total-divider" />
                <div className="total-line price-line">
                  <span>Amount due</span>
                  <span className="amount">{totalPrice} EGP</span>
                </div>
              </div>
            </div>
          </Col>

          {/* ── Contact Form ── */}
          <Col xs={12} lg={7}>
            <div className="checkout-form-card">
              <h5 className="summary-heading">Delivery Details</h5>

              {submitError && (
                <Alert variant="danger" className="mb-3">
                  {submitError}
                </Alert>
              )}

              <Form noValidate onSubmit={handleSubmit}>
                {/* Name */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="customer_name"
                    value={form.customer_name}
                    onChange={handleChange}
                    placeholder="Ahmed Mohamed"
                    className={`form-ctrl-dark ${errors.customer_name ? 'is-invalid' : ''}`}
                  />
                  {errors.customer_name && (
                    <div className="invalid-feedback">{errors.customer_name}</div>
                  )}
                </Form.Group>

                {/* Phone */}
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-dark">Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className={`form-ctrl-dark ${errors.phone ? 'is-invalid' : ''}`}
                  />
                  {errors.phone && (
                    <div className="invalid-feedback">{errors.phone}</div>
                  )}
                </Form.Group>

                {/* Address */}
                <Form.Group className="mb-4">
                  <Form.Label className="form-label-dark">Delivery Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Street, Building, City…"
                    className={`form-ctrl-dark ${errors.address ? 'is-invalid' : ''}`}
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </Form.Group>

                <Button
                  type="submit"
                  variant="warning"
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order…' : `Place Order — ${totalPrice} EGP`}
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
