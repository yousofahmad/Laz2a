import React from 'react';
import { Navbar, Container, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../CartContext';

const WHATSAPP_URL =
  'https://wa.me/201552323060?text=أهلاً،%20عايز%20أطبع%20استيكرات%20مخصوص';

function TopNav({ isDarkMode, onToggleTheme, onOpenCart }) {
  const { totalQuantity } = useCart();

  return (
    <Navbar className="app-navbar py-2 py-md-3" expand={false} sticky="top">
      <Container fluid="xl" className="d-flex align-items-center justify-content-between flex-wrap gap-2">

        {/* Left side: cart + theme toggle */}
        <div className="navbar-actions-left">
          <Button className="btn-cart position-relative" onClick={onOpenCart}>
            <FaShoppingCart />
            {totalQuantity > 0 && (
              <span className="cart-badge badge rounded-pill position-absolute top-0 start-100 translate-middle">
                {totalQuantity}
              </span>
            )}
          </Button>

          <button className="btn-theme-toggle" onClick={onToggleTheme}>
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        {/* Center: Logo */}
        <Navbar.Brand as={Link} to="/" className="navbar-logo-wrap m-0">
          <img
            src="/logo.webp"
            alt="laz2a"
            className="navbar-logo"
            onError={function (e) { e.target.style.display = 'none'; }}
          />
        </Navbar.Brand>

        {/* Right side: brand name + WhatsApp */}
        <div className="navbar-actions-right">
          <Link to="/" className="navbar-brand-text text-metallic text-decoration-none d-none d-sm-inline">
            لزقة | laz2a
          </Link>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-metallic-gold py-1 px-2 px-md-3"
            title="Custom"
          >
            <FaWhatsapp style={{ fontSize: '1.2rem' }} />
            <span className="btn-whatsapp-label d-none d-md-inline ms-1" style={{ letterSpacing: '0.5px' }}>Custom</span>
          </a>
        </div>

      </Container>
    </Navbar>
  );
}

export default TopNav;
