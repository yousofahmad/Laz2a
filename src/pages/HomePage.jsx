import React, { useState, useMemo } from 'react';
import { Container, Row, Col, InputGroup, Form, Nav } from 'react-bootstrap';
import { FaWhatsapp, FaSearch, FaChevronDown } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import catalog from '../data/catalog.json';

const WHATSAPP_URL =
  'https://wa.me/201552323060?text=أهلاً،%20عايز%20أطبع%20استيكرات%20مخصوص';

function HomePage() {
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
  }, []);

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
        (p.title && p.title.toLowerCase().includes(query)) ||
        (pCat.toLowerCase().includes(query));
        
      // Only apply category filter on individual tab
      if (mainTab === 'individual') {
        return matchesCategory && matchesSearch;
      }
      return matchesSearch;
    });
  }, [activeCategory, searchQuery, mainTab]);

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
            استيكرات بريميوم بأفضل الأسعار وأعلى جودة
          </p>
        </Container>

        <div className="scroll-indicator">
          <FaChevronDown />
        </div>
      </div>

      {/* ── Products Section ──────────────────────────────────────── */}
      <div style={{ padding: '2.5rem 0' }}>
        <Container fluid="xl">
          
          {/* Tabs: Individual vs Collections */}
          <Nav variant="pills" className="justify-content-center mb-4 tabs-metallic" onSelect={(k) => setMainTab(k)}>
            <Nav.Item>
              <Nav.Link eventKey="individual" active={mainTab === 'individual'} className="fw-bold fs-5 px-4 rounded-pill">
                استيكرات فردية
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="collections" active={mainTab === 'collections'} className="fw-bold fs-5 px-4 mx-2 rounded-pill">
                كوليكشنات
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
              placeholder="ابحث عن استيكر..."
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
                    {cat}
                  </button>
                );
              })}
            </div>
          )}

          {/* Result count */}
          <p className="filter-count">
            {filteredProducts.length} {mainTab === 'collections' ? 'كوليكشن' : 'استيكر'}
            {mainTab === 'individual' && activeCategory !== 'الكل' && <> في "{activeCategory}"</>}
            {searchQuery && <> · نتائج "{searchQuery}"</>}
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
              <p>مفيش نتائج لـ "{searchQuery}"</p>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
}

export default HomePage;
