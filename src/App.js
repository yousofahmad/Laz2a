import React, { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './footer.css';

import { CartProvider } from './CartContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ProductCatalogProvider } from './ProductCatalogContext';
import TopNav from './components/TopNav';
import AnnouncementBar from './components/AnnouncementBar';
import CartModal from './components/CartModal';
import ScrollToTop from './components/ScrollToTop';
import OffersModal from './components/OffersModal';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import FeedbackPage from './pages/FeedbackPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SchoolLabelsPreviewPage from './pages/SchoolLabelsPreviewPage';
import CollectionsPage from './pages/CollectionsPage';
import NotFoundPage from './pages/NotFoundPage';

function AppShell() {
  const { language } = useLanguage();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const direction = isAdminRoute || language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = isAdminRoute ? 'ar' : language;
  }, [direction, isAdminRoute, language]);

  function handleToggleTheme() {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (newIsDark) document.body.classList.remove('light-mode');
    else document.body.classList.add('light-mode');
  }

  return (
    <CartProvider>
      <div className="app-direction-scope" dir={direction}>
      {!isAdminRoute && <AnnouncementBar />}
      {!isAdminRoute && <TopNav isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} onOpenCart={() => setCartOpen(true)} />}
      {!isAdminRoute && <CartModal show={cartOpen} onHide={() => setCartOpen(false)} />}
      {!isAdminRoute && <OffersModal />}
      {!isAdminRoute && <ScrollToTop />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/labels-preview" element={<SchoolLabelsPreviewPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isAdminRoute && <Footer />}
      </div>
    </CartProvider>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ProductCatalogProvider>
        <AppShell />
      </ProductCatalogProvider>
    </LanguageProvider>
  );
}

export default App;
