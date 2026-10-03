import React from 'react';
import { Link } from 'react-router-dom';
import { FaCartPlus, FaCheck } from 'react-icons/fa';
import { useCart } from '../CartContext';

function ProductCard({ product }) {
  const { cart, addToCart } = useCart();

  const cartItem = cart.find(function (item) {
    return item.product.id === product.id;
  });
  const isInCart = !!cartItem;

  const imageSrc = '/stickers/' + product.relative_path;

  return (
    <div className="product-card">
      {/* Image — click navigates to product detail page */}
      <Link to={'/product/' + product.id} className="product-card-img-link">
        <div className="product-card-img-wrap">
          <img
            src={imageSrc}
            alt={product.title}
            className="product-card-img"
            loading="lazy"
            onError={function (e) {
              e.target.style.display = 'none';
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
          <p className="product-card-name">{product.title}</p>
        </Link>
        <p className="product-card-desc">{product.category_name_ar}</p>
      </div>

      {/* Footer: price + add button */}
      <div className="product-card-footer">
        <span className="product-price">10 ج</span>

        {isInCart ? (
          <button className="btn-in-cart w-100">
            <FaCheck style={{ marginLeft: '5px' }} />
            في السلة ({cartItem.quantity})
          </button>
        ) : (
          <button
            className="btn btn-metallic-gold w-100"
            onClick={function (e) {
              e.preventDefault();
              addToCart(product);
            }}
          >
            <FaCartPlus style={{ marginLeft: '5px' }} />
            أضف
          </button>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
