import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus, FaCheck } from 'react-icons/fa';
import { useCart } from '../CartContext';
import { getProductCardImage } from '../utils/productImages';
import { getProductDiscountPercent, getProductRegularPrice, getProductUnitPrice, isProductDiscountActive } from '../utils/productPricing';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { localizedProductTitle, localizedProductDescription } from '../utils/localization';

function ProductCard({ product }) {
  const { cart, addToCart } = useCart();
  const { language } = useLanguage();
  const [imgLoaded, setImgLoaded] = useState(false);

  const cartItem = cart.find(function (item) {
    return item.product.id === product.id;
  });
  const isInCart = !!cartItem;

  const imageSrc = '/stickers/' + (getProductCardImage(product) || product.relative_path);
  const productTitle = localizedProductTitle(product, language);
  const productDescription = localizedProductDescription(product, language);
  const hasDiscount = isProductDiscountActive(product);

  return (
    <div className="product-card">
      {/* Image — click navigates to product detail page */}
      <Link to={'/product/' + product.id} className="product-card-img-link">
        <div className={`product-card-img-wrap ${!imgLoaded ? 'skeleton-box' : ''}`}>
          <img
            src={imageSrc}
            alt={productTitle}
            className={`product-card-img protected-img fade-in-image ${imgLoaded ? 'loaded' : ''}`}
            loading="lazy"
            decoding="async"
            draggable="false"
            onLoad={() => setImgLoaded(true)}
            onContextMenu={(e) => e.preventDefault()}
            onError={function (e) {
              e.target.style.display = 'none';
              setImgLoaded(true); // stop skeleton
              e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
            }}
          />
          <div className="product-card-img-placeholder" style={{ display: 'none' }}>
            <FaCartPlus style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
          </div>
          {/* Hover overlay */}
          <div className="product-card-img-overlay" />
        </div>
      </Link>

      {/* Card body */}
      <div className="product-card-body">
        <span className="product-card-id">#{product.id}</span>
        <Link to={'/product/' + product.id} className="product-card-name-link">
          <p className="product-card-name">{productTitle}</p>
        </Link>
        <p className="product-card-desc">{productDescription}</p>
      </div>

      {/* Footer: price + add button */}
      <div className="product-card-footer d-flex justify-content-between align-items-center gap-2">
        <span className="product-price product-price-values text-nowrap fs-5 fw-bold text-metallic">
          {hasDiscount && <><del className="product-price-old">{getProductRegularPrice(product)}</del><span className="product-discount-badge">-{getProductDiscountPercent(product)}%</span></>}
          <span>{getProductUnitPrice(product)} {localizedCopy(language, 'EGP', 'جنيه')}</span>
        </span>

        {isInCart ? (
          <button className="btn-in-cart w-100 flex-grow-1">
            <FaCheck style={{ marginLeft: '5px' }} />
            {localizedCopy(language, 'In cart', 'في السلة')} ({cartItem.quantity})
          </button>
        ) : (
          <button
            className="btn btn-metallic-gold w-100 flex-grow-1"
            onClick={function (e) {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <FaCartPlus style={{ marginLeft: '5px' }} />
            {localizedCopy(language, 'Add', 'أضف')}
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
