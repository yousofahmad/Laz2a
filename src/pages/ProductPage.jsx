import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { FaCartPlus, FaCheck, FaArrowRight, FaTag } from 'react-icons/fa';
import { useCart } from '../CartContext';
import ProductCard from '../components/ProductCard';
import catalog from '../data/catalog.json';

function ProductPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { cart, addToCart, updateQuantity } = useCart();

  const [qty, setQty] = useState(1);

  // Find this product in the catalog
  const product = useMemo(function () {
    return catalog.find(function (p) { return String(p.id) === String(id); });
  }, [id]);

  // Similar products: same category, excluding this one, max 4
  const similarProducts = useMemo(function () {
    if (!product) return [];
    return catalog
      .filter(function (p) {
        return p.category_name_ar === product.category_name_ar && p.id !== product.id;
      })
      .slice(0, 4);
  }, [product]);

  // Check cart state for this product
  const cartItem = cart.find(function (item) {
    return product && item.product.id === product.id;
  });
  const isInCart = !!cartItem;

  // 404 state
  if (!product) {
    return (
      <div className="product-page-404">
        <Container>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            الاستيكر مش موجود.
          </p>
          <Button className="btn-cart" onClick={function () { navigate('/'); }}>
            <FaArrowRight style={{ marginLeft: '8px' }} />
            ارجع للمتجر
          </Button>
        </Container>
      </div>
    );
  }

  function handleAddToCart() {
    if (isInCart) {
      updateQuantity(product.id, cartItem.quantity + qty);
    } else {
      // Add the item qty times
      for (let i = 0; i < qty; i++) {
        addToCart(product);
      }
    }
    setQty(1);
  }

  return (
    <div className="product-page">
      <Container fluid="xl">
        {/* Breadcrumb */}
        <nav className="product-breadcrumb">
          <Link to="/">الرئيسية</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{product.category_name_ar}</span>
          <span className="breadcrumb-sep">/</span>
          <span style={{ color: 'var(--text-primary)' }}>{product.title}</span>
        </nav>

        {/* ── Main product layout (RTL: image right, details left) ── */}
        <Row className="product-main-row g-4">
          {/* Image column — RIGHT in RTL */}
          <Col xs={12} md={6} className="product-image-col">
            <div className="product-image-frame">
              <img
                src={'/stickers/' + product.relative_path}
                alt={product.title}
                className="product-detail-img protected-img"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
                onError={function (e) {
                  e.target.parentElement.classList.add('product-image-frame--empty');
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </Col>

          {/* Details column — LEFT in RTL */}
          <Col xs={12} md={6} className="product-details-col">
            {/* Category badge */}
            <div className="mb-2">
              <span className="product-cat-badge d-inline-block mb-3">
                <FaTag style={{ marginLeft: '5px', fontSize: '0.7rem' }} />
                {product.category_name_ar}
              </span>
            </div>

            {/* Title */}
            <h1 className="product-detail-title text-metallic fs-1">{product.title}</h1>

            {/* ID */}
            <p className="product-detail-id">رقم المنتج: #{product.id}</p>

            {/* Price */}
            <div className="product-detail-price">
              <span className="price-amount">{product.isCollection ? product.price : 10}</span>
              <span className="price-currency">جنيه</span>
            </div>

            {/* Quantity selector */}
            <div className="product-qty-row">
              <span className="product-qty-label">الكمية:</span>
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
                = {qty * (product.isCollection ? product.price : 10)} جنيه
              </span>
            </div>

            {/* Add to cart button */}
            {isInCart ? (
              <div className="product-cart-status">
                <FaCheck style={{ marginLeft: '8px', color: 'var(--color-gold)' }} />
                في السلة ({cartItem.quantity})
                <Button
                  className="btn btn-metallic-gold ms-3"
                  onClick={handleAddToCart}
                >
                  <FaCartPlus style={{ marginLeft: '6px' }} />
                  أضف {qty} أكتر
                </Button>
              </div>
            ) : (
              <Button className="btn btn-metallic-gold w-100" style={{ padding: '12px', fontSize: '1.2rem' }} onClick={handleAddToCart}>
                <FaCartPlus style={{ marginLeft: '8px' }} />
                أضف {qty > 1 ? qty + ' ' : ''}للسلة
              </Button>
            )}
          </Col>
        </Row>

        {/* ── Similar Products ──────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <div className="similar-section">
            <h3 className="similar-title">منتجات مشابهة</h3>
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
