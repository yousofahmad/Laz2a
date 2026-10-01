import React from 'react';
import { Navbar, Container, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import './TopNav.css';

/**
 * TopNav — sticky dark navbar with animated cart badge.
 * Props:
 *   onCartOpen: () => void   — opens the CartModal
 */
export default function TopNav({ onCartOpen }) {
  const { paidQty, totalQty } = useCart();

  return (
    <Navbar className="topnav" expand="lg" sticky="top">
      <Container fluid="xl">
        {/* Brand */}
        <Navbar.Brand as={Link} to="/" className="topnav__brand">
          <span className="brand-icon">🎨</span>
          <span className="brand-name">
            لصق <span className="brand-accent">لصقة</span>
          </span>
        </Navbar.Brand>

        {/* Promo ticker */}
        {paidQty >= 5 && (
          <span className="topnav__ticker d-none d-md-inline">
            🎉 You unlocked a promo! Check your cart.
          </span>
        )}

        {/* Cart button */}
        <Button
          variant="warning"
          className="topnav__cart-btn"
          onClick={onCartOpen}
        >
          🛒
          {paidQty > 0 && (
            <Badge bg="dark" className="cart-badge">
              {paidQty}
            </Badge>
          )}
          {totalQty > paidQty && (
            <span className="free-tag ms-1 d-none d-sm-inline">
              +{totalQty - paidQty} FREE
            </span>
          )}
        </Button>
      </Container>
    </Navbar>
  );
}
