import React, { useState, useMemo } from 'react';
import { Container, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { FaWhatsapp, FaSearch } from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import catalog from '../data/catalog.json';

const WHATSAPP_URL =
  'https://wa.me/201552323060?text=أهلاً،%20عايز%20أطبع%20استيكرات%20مخصوص';

function HomePage() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchQuery, setSearchQuery]       = useState('');

  // Extract unique categories in order of first appearance (clean strings)
  const categories = useMemo(function () {
    const seen = new Set();
    const result = ['الكل'];
    catalog.forEach(function (p) {
      if (p.category_name_ar) {
        const cleanCat = p.category_name_ar.trim();
        const normalize = cleanCat.toLowerCase(); // good practice even for Arabic
        if (cleanCat !== '' && !seen.has(normalize)) {
          seen.add(normalize);
          result.push(cleanCat); // Push the correctly cased/spaced one for display
        }
      }
    });
    return result;
  }, []);

  // Filter by category AND search query
  const filteredProducts = useMemo(function () {
    const query = searchQuery.trim().toLowerCase();
    return catalog.filter(function (p) {
      const pCat = p.category_name_ar ? p.category_name_ar.trim() : '';
      const matchesCategory =
        activeCategory === 'الكل' || pCat === activeCategory;
      const matchesSearch =
        !query ||
        (p.title && p.title.toLowerCase().includes(query)) ||
        (pCat.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

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
      </div>

      {/* ── Products Section ──────────────────────────────────────── */}
      <div style={{ padding: '2.5rem 0' }}>
        <Container fluid="xl">
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

          {/* Category filter pills — horizontal scroll, no wrap */}
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

          {/* Result count */}
          <p className="filter-count">
            {filteredProducts.length} استيكر
            {activeCategory !== 'الكل' && <> في "{activeCategory}"</>}
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
