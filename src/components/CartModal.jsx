import React from 'react';
import { Modal, Button, Table, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { promoLabel } from '../utils/promotions';
import './CartModal.css';

/**
 * CartModal — full cart overview with quantity controls and promo summary.
 * Props:
 *   show: boolean
 *   onHide: () => void
 */
export default function CartModal({ show, onHide }) {
  const { items, paidQty, freeQty, totalQty, totalPrice, activeTier, setQuantity, removeItem } =
    useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onHide();
    navigate('/checkout');
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      contentClassName="cart-modal-content"
    >
      <Modal.Header closeButton closeVariant="white" className="cart-modal-header">
        <Modal.Title>🛒 Your Cart</Modal.Title>
      </Modal.Header>

      <Modal.Body className="cart-modal-body">
        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon">😶</span>
            <p>Your cart is empty. Go pick some stickers!</p>
          </div>
        ) : (
          <>
            {/* Promo Banner */}
            {activeTier && (
              <div className="promo-banner">
                {promoLabel(activeTier)}
              </div>
            )}

            {/* Items Table */}
            <Table responsive borderless className="cart-table">
              <thead>
                <tr>
                  <th>Sticker</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="cart-item">
                        <img src={item.image} alt={item.name} className="cart-item__img" />
                        <span className="cart-item__name">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-center align-middle">
                      <div className="qty-controls">
                        <button
                          className="qty-btn"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>
                        <Form.Control
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            setQuantity(item.id, parseInt(e.target.value, 10) || 1)
                          }
                          className="qty-input"
                        />
                        <button
                          className="qty-btn"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-end align-middle text-warning fw-bold">
                      {item.quantity * 10} EGP
                    </td>
                    <td className="align-middle">
                      <button className="remove-btn" onClick={() => removeItem(item.id)}>
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Summary */}
            <div className="cart-summary">
              <div className="summary-row">
                <span>Stickers you pay for</span>
                <span>{paidQty}</span>
              </div>
              {freeQty > 0 && (
                <div className="summary-row free-row">
                  <span>🎁 Free stickers earned</span>
                  <span>+{freeQty}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total stickers received</span>
                <span className="text-warning">{totalQty}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row price-row">
                <span>Amount due</span>
                <span className="price-tag">{totalPrice} EGP</span>
              </div>
            </div>
          </>
        )}
      </Modal.Body>

      {items.length > 0 && (
        <Modal.Footer className="cart-modal-footer">
          <Button variant="outline-secondary" onClick={onHide}>
            Continue Shopping
          </Button>
          <Button variant="warning" className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout →
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}
