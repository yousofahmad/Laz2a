import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTrash, FaTimes } from 'react-icons/fa';
import { useCart } from '../CartContext';

function CartModal({ show, onHide }) {
  const {
    cart, totalQuantity,
    subtotal, discountAmount, finalTotal, freeItems, itemsToNextTier,
    updateQuantity, removeFromCart,
  } = useCart();
  const navigate = useNavigate();

  function handleCheckout() {
    onHide();
    navigate('/checkout');
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered contentClassName="cart-modal-content border-metallic">
      <Modal.Header closeButton closeVariant="white" className="cart-modal-header">
        <Modal.Title style={{ color: 'var(--color-gold)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaShoppingCart /> سلة المشتريات
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ padding: '1.25rem 1.5rem' }}>
        {/* Empty state */}
        {cart.length === 0 && (
          <p className="cart-empty-msg">السلة فارغة. اختار استيكراتك!</p>
        )}

        {/* Items list */}
        {cart.map(function (item) {
          return (
            <div key={item.product.id} className="cart-item-row">
              {/* Image */}
              <img
                src={'/stickers/' + item.product.relative_path}
                alt={item.product.title}
                className="cart-item-img protected-img"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                onError={function (e) { e.target.style.display = 'none'; }}
              />

              {/* Name + ID */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cart-item-name">{item.product.title}</div>
                <div className="cart-item-id">#{item.product.id}</div>
              </div>

              {/* Quantity controls */}
              <div className="qty-controls">
                <button
                  className="qty-btn"
                  onClick={function () { updateQuantity(item.product.id, item.quantity - 1); }}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={function () { updateQuantity(item.product.id, item.quantity + 1); }}
                >
                  +
                </button>
              </div>

              {/* Item subtotal */}
              <div className="cart-item-subtotal">
                {item.product.isCollection ? item.product.price * item.quantity : item.quantity * 10} ج
              </div>

              {/* Remove */}
              <button
                className="btn-remove"
                onClick={function () { removeFromCart(item.product.id); }}
                title="حذف"
              >
                <FaTimes />
              </button>
            </div>
          );
        })}

        {/* Pricing summary */}
        {cart.length > 0 && (
          <div className="cart-summary">
            {/* Next tier nudge */}
            {itemsToNextTier !== null && (
              <p className="cart-nudge">
                أضف {itemsToNextTier} استيكر فردي كمان وهتوفر أكتر!
              </p>
            )}

            {/* Subtotal row */}
            <div className="cart-summary-row">
              <span>المجموع الأصلي</span>
              <span>{subtotal} ج</span>
            </div>

            {/* Discount row — shown only when active */}
            {discountAmount > 0 && (
              <div className="cart-summary-row cart-discount-row">
                <span>خصم العروض ({freeItems} مجاناً)</span>
                <span>− {discountAmount} ج</span>
              </div>
            )}

            {/* Final total */}
            <div className="cart-summary-row cart-total-row">
              <span className="cart-total-label">الإجمالي</span>
              <span className="cart-total-price">{finalTotal} جنيه</span>
            </div>

            {/* Free stickers alert */}
            {freeItems > 0 && (
              <div className="free-stickers-alert">
                <strong>كسبت {freeItems} استيكر مجاناً!</strong>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      {cart.length > 0 && (
        <Modal.Footer className="cart-modal-footer">
          <Button className="btn btn-metallic-gold" onClick={onHide}>
            كمّل تسوق
          </Button>
          <Button className="btn btn-metallic-gold" onClick={handleCheckout}>
            إتمام الطلب
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default CartModal;
