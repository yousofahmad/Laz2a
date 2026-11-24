import React, { useState, useMemo } from 'react';
import { Container, Row, Col, InputGroup, Form, Nav } from 'react-bootstrap';
import { FaWhatsapp, FaSearch, FaChevronDown } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import VerifiedFeedbackCarousel from '../components/VerifiedFeedbackCarousel';
import { useProductCatalog } from '../ProductCatalogContext';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { localizedCategory, localizedProductTitle, localizedProductDescription } from '../utils/localization';

const WHATSAPP_BUSINESS_PHONE = '201552323060';

function HomePage() {
  const { products: catalog } = useProductCatalog();
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery]       = useState('');
  const [mainTab, setMainTab]               = useState('individual'); // 'individual' or 'collections'

  // Extract unique categories for individual stickers only
  const categories = useMemo(function () {
    const seen = new Set();
    const result = ['الكل'];
    catalog.forEach(function (p) {
      if (p.category_name_ar && !p.isCollection) {
        const cleanCat = p.category_name_ar.trim();
        const normalize = cleanCat.toLowerCase();
        if (cleanCat !== '' && !seen.has(normalize)) {
          seen.add(normalize);
          result.push(cleanCat);
        }
      }
    });
    return result;
  }, [catalog]);

  // Filter by tab, category AND search query
  const filteredProducts = useMemo(function () {
    const query = searchQuery.trim().toLowerCase();
    return catalog.filter(function (p) {
      const isCol = !!p.isCollection;
      if (mainTab === 'collections' && !isCol) return false;
      if (mainTab === 'individual' && isCol) return false;

      const pCat = p.category_name_ar ? p.category_name_ar.trim() : '';
      const matchesCategory =
        activeCategory === 'الكل' || pCat === activeCategory;
      const matchesSearch =
        !query ||
        [
          p.title,
          p.title_original,
          p.description_ar,
          pCat,
          localizedProductTitle(p, language),
          localizedProductDescription(p, language),
          localizedCategory(pCat, language),
        ]
          .some(function (value) {
            return value && value.toLowerCase().includes(query);
          });
        
      // Only apply category filter on individual tab
      if (mainTab === 'individual') {
        return matchesCategory && matchesSearch;
      }
      return matchesSearch;
    });
  }, [activeCategory, searchQuery, mainTab, language, catalog]);

  const whatsappMessage = localizedCopy(
    language,
    'Hello, I would like to print custom stickers',
    'أهلاً، عايز أطبع استيكرات مخصوص'
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* ── Hero Section ──────────────────────────────────────────── */}
      <div className="hero-section">
        <Container fluid="xl" className="text-center">
          {/* Large centered logo */}
          <div className="hero-logo-wrap">
            <img
              src="/logo.webp"
              alt="laz2a"
              className="hero-logo"
              onError={function (e) { e.target.style.display = 'none'; }}
            />
          </div>

          <p className="hero-subtitle text-metallic fw-bold" style={{ fontSize: '1.3rem', marginBottom: '0', textAlign: 'center' }}>
            {localizedCopy(language, 'Premium stickers at the best prices and highest quality', 'استيكرات بريميوم بأفضل الأسعار وأعلى جودة')}
          </p>
          <div className="hero-custom-order">
            <span>{localizedCopy(language, 'Have a custom design?', 'عندك تصميم خاص؟')}</span>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label={localizedCopy(language, 'Order a custom sticker design via WhatsApp', 'اطلب تصميم استيكر خاص عبر واتساب')}>
              <FaWhatsapp aria-hidden="true" /> {localizedCopy(language, 'Order it on WhatsApp', 'اطلبه على واتساب')}
            </a>
          </div>
        </Container>

        <div className="scroll-indicator">
          <FaChevronDown />
        </div>
      </div>

      <VerifiedFeedbackCarousel />

      {/* ── Products Section ──────────────────────────────────────── */}
      <div className="home-products-section">
        <Container fluid="xl">
          
          {/* Tabs: Individual vs Collections */}
          <Nav variant="pills" className="justify-content-center mb-4 tabs-metallic" onSelect={(k) => setMainTab(k)}>
            <Nav.Item>
              <Nav.Link eventKey="individual" active={mainTab === 'individual'} className="fw-bold fs-5 px-4 rounded-pill">
                {localizedCopy(language, 'Individual stickers', 'استيكرات فردية')}
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="collections" active={mainTab === 'collections'} className="fw-bold fs-5 px-4 mx-2 rounded-pill">
                {localizedCopy(language, 'Collections', 'كوليكشنات')}
              </Nav.Link>
            </Nav.Item>
          </Nav>

          {/* Search bar */}
          <InputGroup className="search-bar mb-4">
            <InputGroup.Text className="search-icon">
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={localizedCopy(language, 'Search stickers...', 'ابحث عن استيكر...')}
              className="form-ctrl search-input"
              value={searchQuery}
              onChange={function (e) { setSearchQuery(e.target.value); }}
            />
          </InputGroup>

          {/* Category filter pills — only show if on individual tab */}
          {mainTab === 'individual' && (
            <div className="category-container">
              {categories.map(function (cat) {
                return (
                  <button
                    key={cat}
                    className={'btn-filter' + (activeCategory === cat ? ' active' : '')}
                    onClick={function () { setActiveCategory(cat); }}
                  >
                    {localizedCategory(cat, language)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Result count */}
          <p className="filter-count">
            {filteredProducts.length} {mainTab === 'collections'
              ? localizedCopy(language, 'collection', 'كوليكشن')
              : localizedCopy(language, 'sticker', 'استيكر')}
            {mainTab === 'individual' && activeCategory !== 'الكل' && <> {localizedCopy(language, 'in', 'في')} "{localizedCategory(activeCategory, language)}"</>}
            {searchQuery && <> · {localizedCopy(language, 'Results for', 'نتائج')} "{searchQuery}"</>}
          </p>

          {/* Products grid */}
          {filteredProducts.length > 0 ? (
            <Row className="g-3">
              {filteredProducts.map(function (product) {
                return (
                  <Col key={product.id} xs={6} sm={6} md={4} lg={3}>
                    <ProductCard product={product} />
                  </Col>
                );
              })}
            </Row>
          ) : (
            <div className="empty-search-state">
              <FaSearch style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <p>{localizedCopy(language, 'No results for', 'مفيش نتائج لـ')} "{searchQuery}"</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default HomePage;
