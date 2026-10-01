import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import { CartProvider } from './CartContext';
import TopNav       from './components/TopNav';
import CartModal    from './components/CartModal';
import HomePage     from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage  from './pages/SuccessPage';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      {/* Sticky navbar */}
      <TopNav onCartOpen={() => setCartOpen(true)} />

      {/* Cart slide-over modal */}
      <CartModal show={cartOpen} onHide={() => setCartOpen(false)} />

      {/* Pages */}
      <Routes>
        <Route path="/"         element={<HomePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success"  element={<SuccessPage />} />
      </Routes>
    </CartProvider>
  );
}
