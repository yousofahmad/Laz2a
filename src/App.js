import React, { useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { CartProvider } from './CartContext';
import TopNav from './components/TopNav';
import AnnouncementBar from './components/AnnouncementBar';
import CartModal from './components/CartModal';
import ScrollToTop from './components/ScrollToTop';
import OffersModal from './components/OffersModal';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  function handleToggleTheme() {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }

  return (
    <CartProvider>
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <TopNav isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} onOpenCart={() => setCartOpen(true)} />}
      {!isAdminRoute && <CartModal show={cartOpen} onHide={() => setCartOpen(false)} />}
      {!isAdminRoute && <OffersModal />}
      {!isAdminRoute && <ScrollToTop />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </CartProvider>
  );
}

export default App;
