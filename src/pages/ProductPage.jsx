import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaCartPlus, FaCheck, FaArrowRight, FaTag } from 'react-icons/fa';
import { useCart } from '../CartContext';
import ProductCard from '../components/ProductCard';
import { useProductCatalog } from '../ProductCatalogContext';
import { getProductImages } from '../utils/productImages';
import { getProductDiscountPercent, getProductRegularPrice, getProductUnitPrice, isProductDiscountActive } from '../utils/productPricing';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { localizedProductTitle, localizedProductDescription, localizedCategory } from '../utils/localization';

function ProductPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();
  const { products: catalog } = useProductCatalog();
  const { language } = useLanguage();

  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Find this product in the catalog
  const product = useMemo(function () {
    return catalog.find(function (p) { return String(p.id) === String(id); });
  }, [id, catalog]);
  const hasDiscount = isProductDiscountActive(product);

  // Similar products: same category, excluding this one, max 4
  const similarProducts = useMemo(function () {
    if (!product) return [];
    if (product.isCollection && Array.isArray(product.member_ids)) {
      const includedIds = new Set(product.member_ids.map(String));
      return catalog.filter(function (p) { return includedIds.has(String(p.id)); }).slice(0, 15);
    }
    return catalog
      .filter(function (p) {
        return p.category_name_ar === product.category_name_ar && p.id !== product.id;
      })
      .slice(0, 4);
  }, [product, catalog]);

  const colorVariants = product && Array.isArray(product.color_variants) ? product.color_variants : [];
  const activeVariantValue = colorVariants.some((variant) => variant.value === selectedVariant)
    ? selectedVariant
    : product?.variant_default || colorVariants[0]?.value || null;
  const productImages = useMemo(() => getProductImages(product, activeVariantValue), [product, activeVariantValue]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setImgLoaded(false);
    setSelectedVariant(product?.variant_default || null);
  }, [id, product?.variant_default]);
  const visibleImageIndex = productImages.length ? Math.min(activeImageIndex, productImages.length - 1) : 0;
  const productTitle = localizedProductTitle(product, language);
  const productDescription = localizedProductDescription(product, language);
  const productCategory = localizedCategory(product && product.category_name_ar, language);

  // Check cart state for this product
  const cartItem = cart.find(function (item) {
    return product && item.product.id === product.id && (item.variant || null) === (activeVariantValue || null);
  });
  const isInCart = !!cartItem;

  // 404 state
  if (!product) {
    return (
      <div className="product-page-404">
        <Container>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            {localizedCopy(language, 'Sticker not found.', 'الاستيكر مش موجود.')}
          </p>
          <Button className="btn-cart" onClick={function () { navigate('/'); }}>
            <FaArrowRight style={{ marginLeft: '8px' }} />
            {localizedCopy(language, 'Back to store', 'ارجع للمتجر')}
          </Button>
        </Container>
      </div>
    );
  }

  function handleAddToCart() {
    if (isInCart) {
      updateQuantity(product.id, cartItem.quantity + qty, activeVariantValue);
    } else {
      // Add the item qty times
      for (let i = 0; i < qty; i++) {
        addToCart(product, activeVariantValue);
      }
    }
    setQty(1);
  }

  return (
    <div className="product-page">
      <Container fluid="xl">
        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
          <Link to="/">{localizedCopy(language, 'Home', 'الرئيسية')}</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{productCategory}</span>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>{productTitle}</span>
        </nav>

        {/* ── Main product layout (RTL: image right, details left) ── */}
        <Row className="product-main-row g-4">
          {/* Image column — RIGHT in RTL */}
          <Col xs={12} md={6} className="product-image-col">
            <div className={`product-image-frame ${!imgLoaded ? 'skeleton-box' : ''}`}>
              <img
                key={productImages[visibleImageIndex] || product.relative_path}
                src={'/stickers/' + (productImages[visibleImageIndex] || product.relative_path)}
                alt={`${productTitle}${productImages.length > 1 ? ` — ${localizedCopy(language, 'image', 'صورة')} ${visibleImageIndex + 1}` : ''}`}
                className={`product-detail-img protected-img fade-in-image ${imgLoaded ? 'loaded' : ''}`}
                draggable="false"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                onContextMenu={(e) => e.preventDefault()}
                onError={function (e) {
                  e.target.parentElement.classList.add('product-image-frame--empty');
                  setImgLoaded(true);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="product-gallery-thumbnails" role="group" aria-label={localizedCopy(language, 'Product images', 'صور المنتج')}>
                {productImages.map((imagePath, index) => (
                  <button
                    key={`${imagePath}-${index}`}
                    type="button"
                    className={`product-gallery-thumb${index === visibleImageIndex ? ' product-gallery-thumb--active' : ''}`}
                    aria-label={`${localizedCopy(language, 'View image', 'عرض الصورة')} ${index + 1} ${localizedCopy(language, 'of', 'من')} ${productImages.length}`}
                    aria-pressed={index === visibleImageIndex}
                    onClick={() => { setActiveImageIndex(index); setImgLoaded(false); }}
                  >
                    <img src={'/stickers/' + imagePath} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </Col>

          {/* Details column — LEFT in RTL */}
          <Col xs={12} md={6} className="product-details-col">
            {/* Category badge */}
            <div className="mb-2">
              <span className="product-cat-badge d-inline-block mb-3">
                <FaTag style={{ marginLeft: '5px', fontSize: '0.7rem' }} />
                {productCategory}
              </span>
            </div>

            {/* Title */}
            <h1 className="product-detail-title text-metallic fs-1">{productTitle}</h1>

            {productDescription && <p className="product-detail-description">{productDescription}</p>}

            {colorVariants.length > 0 && (
              <fieldset className="product-variant-picker">
                <legend className="product-variant-label">
                  {localizedCopy(language, 'Choose a color', 'اختار اللون')}
                </legend>
                <div className="product-variant-options">
                  {colorVariants.map((variant) => (
                    <button
                      key={variant.value}
                      type="button"
                      className={`product-variant-option${activeVariantValue === variant.value ? ' product-variant-option--active' : ''}`}
                      aria-pressed={activeVariantValue === variant.value}
                      onClick={() => {
                        setSelectedVariant(variant.value);
                        setActiveImageIndex(0);
                        setImgLoaded(false);
                      }}
                    >
                      <span className={`product-variant-swatch product-variant-swatch--${variant.value}`} aria-hidden="true" />
                      {localizedCopy(language, variant.label_en, variant.label_ar)}
                    </button>
                  ))}
                </div>
                <p className="product-variant-note">
                  {activeVariantValue === 'white'
                    ? localizedCopy(language, 'White design shown on a dark laptop.', 'الرسمة البيضاء معروضة على لابتوب غامق.')
                    : activeVariantValue === 'black'
                      ? localizedCopy(language, 'Black design shown on a light laptop.', 'الرسمة السوداء معروضة على لابتوب فاتح.')
                      : ''}
                </p>
              </fieldset>
            )}

            {/* ID */}
            <p className="product-detail-id">{localizedCopy(language, 'Product no.', 'رقم المنتج')}: #{product.id}</p>

            {/* Price */}
            <div className="product-detail-price">
              {hasDiscount && <span className="product-detail-price-old">{getProductRegularPrice(product)} {localizedCopy(language, 'EGP', 'جنيه')} <span className="product-discount-badge">-{getProductDiscountPercent(product)}%</span></span>}
              <span className="price-amount">{getProductUnitPrice(product)}</span>
              <span className="price-currency">{localizedCopy(language, 'EGP', 'جنيه')}</span>
            </div>

            {/* Quantity selector */}
            <div className="product-qty-row">
              <span className="product-qty-label">{localizedCopy(language, 'Quantity:', 'الكمية:')}</span>
              <div className="qty-controls qty-controls-lg ms-2">
                <button
                  className="qty-btn"
                  onClick={function () { setQty(function (q) { return Math.max(1, q - 1); }); }}
                >
                  −
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={function () { setQty(function (q) { return q + 1; }); }}
                >
                  +
                </button>
              </div>
              <span className="product-qty-total ms-4">
                = {qty * getProductUnitPrice(product)} {localizedCopy(language, 'EGP', 'جنيه')}
              </span>
            </div>

            {/* Add to cart button */}
            {isInCart ? (
              <div className="product-cart-status">
                <FaCheck style={{ marginLeft: '8px', color: 'var(--color-gold)' }} />
                {localizedCopy(language, 'In cart', 'في السلة')} ({cartItem.quantity})
                <Button
                  className="btn btn-metallic-gold ms-3"
                  onClick={handleAddToCart}
                >
                  <FaCartPlus style={{ marginLeft: '6px' }} />
                  {localizedCopy(language, `Add ${qty} more`, `أضف ${qty} أكتر`)}
                </Button>
              </div>
            ) : (
              <Button className="btn btn-metallic-gold w-100" style={{ padding: '12px', fontSize: '1.2rem' }} onClick={handleAddToCart}>
                <FaCartPlus style={{ marginLeft: '8px' }} />
                {localizedCopy(
                  language,
                  `Add ${qty > 1 ? qty + ' ' : ''}to cart`,
                  `أضف ${qty > 1 ? qty + ' ' : ''}للسلة`
                )}
              </Button>
            )}
          </Col>
        </Row>

        {/* ── Similar Products ──────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <div className="similar-section">
            <h3 className="similar-title">
              {product.isCollection
                ? localizedCopy(language, `Collection contents (${similarProducts.length})`, `محتويات المجموعة (${similarProducts.length})`)
                : localizedCopy(language, 'Similar products', 'منتجات مشابهة')}
            </h3>
            <Row className="g-3">
              {similarProducts.map(function (p) {
                return (
                  <Col key={p.id} xs={6} sm={6} md={4} lg={3}>
                    <ProductCard product={p} />
                  </Col>
                );
              })}
            </Row>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ProductPage;
