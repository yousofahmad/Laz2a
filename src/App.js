import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { CartProvider } from './CartContext';
import TopNav       from './components/TopNav';
import AnnouncementBar from './components/AnnouncementBar';
import CartModal    from './components/CartModal';
import ScrollToTop  from './components/ScrollToTop';
import HomePage     from './pages/HomePage';
import ProductPage  from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage    from './pages/AdminPage';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cartOpen, setCartOpen]     = useState(false);

  function handleToggleTheme() {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }

  return (
    <CartProvider>
      <AnnouncementBar />
      <TopNav
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onOpenCart={function () { setCartOpen(true); }}
      />

      <CartModal
        show={cartOpen}
        onHide={function () { setCartOpen(false); }}
      />

      <ScrollToTop />
      <Routes>
        <Route path="/"            element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout"    element={<CheckoutPage />} />
        <Route path="/admin"       element={<AdminPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
