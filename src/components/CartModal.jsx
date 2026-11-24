import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaTimes } from 'react-icons/fa';
import { useCart } from '../CartContext';
import { localizedCopy, useLanguage } from '../LanguageContext';
import { getProductCardImage } from '../utils/productImages';
import { getProductRegularPrice, getProductUnitPrice, isProductDiscountActive } from '../utils/productPricing';
import { localizedProductTitle } from '../utils/localization';

function CartModal({ show, onHide }) {
  const {
    cart,
    subtotal, discountAmount, finalTotal, freeItems, itemsToNextTier, nextTier,
    updateQuantity, removeFromCart,
  } = useCart();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = (english, arabic) => localizedCopy(language, english, arabic);

  function handleCheckout() {
    onHide();
    navigate('/checkout');
  }

  return (
    <Modal dir={language === 'ar' ? 'rtl' : 'ltr'} show={show} onHide={onHide} size="lg" centered contentClassName="cart-modal-content border-metallic">
      <Modal.Header className="cart-modal-header">
        <Modal.Title style={{ color: 'var(--color-gold)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaShoppingCart /> {t('Shopping cart', 'سلة المشتريات')}
        </Modal.Title>
        <button
          type="button"
          className="btn-close btn-close-white"
          aria-label={t('Close shopping cart', 'إغلاق سلة المشتريات')}
          title={t('Close', 'إغلاق')}
          onClick={onHide}
        />
      </Modal.Header>

      <Modal.Body style={{ padding: '1.25rem 1.5rem' }}>
        {/* Empty state */}
        {cart.length === 0 && (
          <p className="cart-empty-msg">{t('Your cart is empty. Choose your stickers!', 'السلة فارغة. اختار استيكراتك!')}</p>
        )}

        {/* Items list */}
        {cart.map(function (item, itemIndex) {
          const selectedVariant = (item.product.color_variants || []).find((variant) => variant.value === item.variant);
          return (
            <div key={`${item.product.id}:${item.variant || 'default'}:${JSON.stringify(item.customization || null)}:${itemIndex}`} className="cart-item-row">
              {/* Image */}
              <img
                src={'/stickers/' + (getProductCardImage(item.product, item.variant) || item.product.relative_path)}
                alt={localizedProductTitle(item.product, language)}
                className="cart-item-img protected-img"
                loading="lazy"
                decoding="async"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                onError={function (e) { e.target.style.display = 'none'; }}
              />

              {/* Name + ID */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cart-item-name">{localizedProductTitle(item.product, language)}</div>
                <div className="cart-item-id">#{item.product.id}</div>
                {selectedVariant && <div className="cart-item-variant">{localizedCopy(language, selectedVariant.label_en, selectedVariant.label_ar)}</div>}
                {item.customization && (
                  <div style={{ marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    <strong>{item.customization.designTitleAr || item.customization.designTitleEn || t('Custom text', 'نص مخصص')}</strong>
                    <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.customization.text || [item.customization.fields?.name, item.customization.fields?.className].filter(Boolean).join('\n')}</div>
                  </div>
                )}
              </div>

              {/* Quantity controls */}
              <div className="qty-controls">
                <button
                  type="button"
                  className="qty-btn"
                  onClick={function () { updateQuantity(item.product.id, item.quantity - 1, item.variant, item.customization || null); }}
                  title={t('Decrease quantity', 'تقليل الكمية')}
                  aria-label={t('Decrease quantity', 'تقليل الكمية')}
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  type="button"
                  className="qty-btn"
                  onClick={function () { updateQuantity(item.product.id, item.quantity + 1, item.variant, item.customization || null); }}
                  title={t('Increase quantity', 'زيادة الكمية')}
                  aria-label={t('Increase quantity', 'زيادة الكمية')}
                >
                  +
                </button>
              </div>

              {/* Item subtotal */}
              <div className="cart-item-subtotal">
                {isProductDiscountActive(item.product) && <del className="cart-item-old-total">{getProductRegularPrice(item.product) * item.quantity} {t('EGP', 'ج')}</del>}
                <span>{getProductUnitPrice(item.product) * item.quantity} {t('EGP', 'ج')}</span>
              </div>

              {/* Remove */}
              <button
                type="button"
                className="btn-remove"
                onClick={function () { removeFromCart(item.product.id, item.variant, item.customization || null); }}
                title={t('Remove item', 'حذف')}
                aria-label={t('Remove item', 'حذف')}
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
                {t(`Add ${itemsToNextTier} more individual stickers to save more!`, `أضف ${itemsToNextTier} استيكر فردي كمان وهتوفر أكتر!`)}
              </p>
            )}

            {/* Subtotal row */}
            <div className="cart-summary-row">
              <span>{t('Original subtotal', 'المجموع الأصلي')}</span>
              <span>{subtotal} {t('EGP', 'ج')}</span>
            </div>

            {/* Discount row — shown only when active */}
            {discountAmount > 0 && (
              <div className="cart-summary-row cart-discount-row">
                <span>{t(`Offer discount (${freeItems} free)`, `خصم العروض (${freeItems} مجاناً)`)}</span>
                <span>− {discountAmount} {t('EGP', 'ج')}</span>
              </div>
            )}

            {/* Final total */}
            <div className="cart-summary-row cart-total-row">
              <span className="cart-total-label">{t('Total', 'الإجمالي')}</span>
              <span className="cart-total-price">{finalTotal} {t('EGP', 'جنيه')}</span>
            </div>

            {/* Next Tier Nudge Alert */}
            {itemsToNextTier && nextTier && itemsToNextTier <= 10 && (
              <div className="next-tier-alert" style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '10px', textAlign: 'center', backgroundColor: 'rgba(201, 168, 76, 0.1)', padding: '8px', borderRadius: '8px' }}>
                {t(
                  <>Add <strong>{itemsToNextTier}</strong> more stickers to get <strong>{nextTier.freeItems}</strong> free!</>,
                  <>ضيف <strong>{itemsToNextTier}</strong> استيكرات كمان وهتاخد <strong>{nextTier.freeItems}</strong> مجاناً!</>,
                )}
              </div>
            )}

            {/* Free stickers alert */}
            {freeItems > 0 && (
              <div className="free-stickers-alert">
                <strong>{t(`You earned ${freeItems} free stickers!`, `كسبت ${freeItems} استيكر مجاناً!`)}</strong>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      {cart.length > 0 && (
        <Modal.Footer className="cart-modal-footer">
          <Button className="btn btn-metallic-gold" onClick={onHide}>
            {t('Continue shopping', 'كمّل تسوق')}
          </Button>
          <Button className="btn btn-metallic-gold" onClick={handleCheckout}>
            {t('Checkout', 'إتمام الطلب')}
          </Button>
        </Modal.Footer>
      )}
    </Modal>
  );
}

export default CartModal;
