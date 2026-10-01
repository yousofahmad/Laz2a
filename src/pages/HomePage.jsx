import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import stickers from '../data/stickers';
import { TIERS } from '../utils/promotions';
import './HomePage.css';

const CATEGORIES = ['All', ...new Set(stickers.map((s) => s.category))];

/**
 * HomePage — Hero section + filterable sticker grid + promotions table.
 */
export default function HomePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = stickers.filter((s) => {
    const matchCat = category === 'All' || s.category === category;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg-grid" aria-hidden />
        <Container className="hero__content">
          <div className="hero__badge">✨ Free stickers when you bulk order</div>
          <h1 className="hero__title">
            The Coolest Stickers
            <br />
            <span className="hero__title--accent">in Egypt 🇪🇬</span>
          </h1>
          <p className="hero__sub">
            Premium die-cut stickers. Waterproof. Vivid. Yours.
            <br />
            Buy more, get more — free.
          </p>
          <a href="#shop" className="hero__cta">
            Shop Now →
          </a>
        </Container>
      </section>

      {/* ── Promotions Strip ──────────────────────────────────────── */}
      <section className="promo-strip">
        <Container>
          <h2 className="section-title">🎁 Bulk Deal Tiers</h2>
          <div className="promo-table-wrap">
            <table className="promo-table">
              <thead>
                <tr>
                  <th>You Pay For</th>
                  <th>You Get FREE</th>
                  <th>Total Received</th>
                  <th>Price (EGP)</th>
                </tr>
              </thead>
              <tbody>
                {[...TIERS].reverse().map((t) => (
                  <tr key={t.buy}>
                    <td>{t.buy} stickers</td>
                    <td className="free-col">+{t.free}</td>
                    <td>{t.buy + t.free} stickers</td>
                    <td className="price-col">{t.buy * 10} EGP</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* ── Shop Grid ─────────────────────────────────────────────── */}
      <section className="shop-grid" id="shop">
        <Container>
          <h2 className="section-title">🛍 Browse Stickers</h2>

          {/* Filters */}
          <Row className="mb-4 g-3 align-items-center">
            <Col xs={12} md={5}>
              <InputGroup>
                <InputGroup.Text className="filter-addon">🔍</InputGroup.Text>
                <Form.Control
                  placeholder="Search stickers…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="filter-input"
                />
              </InputGroup>
            </Col>
            <Col xs={12} md={7}>
              <div className="category-pills">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    className={`cat-pill ${category === c ? 'cat-pill--active' : ''}`}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </Col>
          </Row>

          {/* Grid */}
          {filtered.length === 0 ? (
            <p className="text-center text-muted py-5">No stickers match your search.</p>
          ) : (
            <Row xs={2} sm={2} md={3} lg={4} className="g-3">
              {filtered.map((s) => (
                <Col key={s.id}>
                  <ProductCard sticker={s} />
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </section>
    </>
  );
}
