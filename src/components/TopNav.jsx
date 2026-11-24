import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSun, FaMoon, FaShoppingCart, FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../CartContext';
import { localizedCopy, useLanguage } from '../LanguageContext';

function TopNav({ isDarkMode, onToggleTheme, onOpenCart }) {
  const { totalQuantity } = useCart();
  const { language, setLanguage } = useLanguage();
  const t = (english, arabic) => localizedCopy(language, english, arabic);
  const whatsappMessage = t(
    'Hello, I want to print custom stickers',
    'أهلاً، عايز أطبع استيكرات مخصوص',
  );
  const whatsappUrl = `https://wa.me/201552323060?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <Navbar className="app-navbar py-2 py-md-3" expand={false} sticky="top">
      <Container fluid="xl" className="d-flex align-items-center justify-content-between flex-wrap gap-2">

        {/* Left side: cart + theme toggle */}
        <div className="navbar-actions-left">
          <Button
            className="btn-cart position-relative"
            onClick={onOpenCart}
            title={t('Shopping cart', 'سلة المشتريات')}
            aria-label={t('Shopping cart', 'سلة المشتريات')}
          >
            <FaShoppingCart />
            {totalQuantity > 0 && (
              <span className="cart-badge badge rounded-pill position-absolute top-0 start-100 translate-middle">
                {totalQuantity}
              </span>
            )}
          </Button>

          <button
            type="button"
            className="btn-theme-toggle"
            onClick={onToggleTheme}
            title={t('Toggle dark mode', 'تبديل الوضع الداكن')}
            aria-label={t('Toggle dark mode', 'تبديل الوضع الداكن')}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            type="button"
            className="btn-language-toggle"
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            title={t('Switch to Arabic', 'التبديل إلى الإنجليزية')}
            aria-label={t('Switch to Arabic', 'التبديل إلى الإنجليزية')}
          >
            {language === 'en' ? 'عربي' : 'EN'}
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
            لازقة | laz2a
          </Link>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-metallic-gold btn-whatsapp py-1 px-2 px-md-3"
            title={t('WhatsApp — request a custom design', 'واتساب — اطلب تصميمًا خاصًا')}
            aria-label={t('WhatsApp — request a custom design', 'واتساب — اطلب تصميمًا خاصًا')}
          >
            <FaWhatsapp style={{ fontSize: '1.2rem' }} />
            <span className="btn-whatsapp-label">{t('Custom design', 'تصميم خاص')}</span>
          </a>
        </div>

      </Container>
    </Navbar>
  );
}

export default TopNav;
