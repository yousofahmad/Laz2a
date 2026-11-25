import React, { useMemo } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { useProductCatalog } from '../ProductCatalogContext';
import { localizedCopy, useLanguage } from '../LanguageContext';

export default function CollectionsPage() {
  const { products: catalog } = useProductCatalog();
  const { language } = useLanguage();

  const collections = useMemo(
    () => catalog.filter((p) => !!p.isCollection),
    [catalog]
  );

  return (
    <div style={{ paddingBottom: '4rem' }}>
      <Container fluid="xl">
        <h1 className="text-center" style={{ margin: '2rem 0 0.5rem' }}>
          {localizedCopy(language, 'Collections', 'كوليكشنات')}
        </h1>
        <p className="text-center" style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          {localizedCopy(
            language,
            'Curated sticker sets, ready to pick.',
            'مجموعات استيكرات جاهزة، اختار اللي يعجبك.'
          )}
        </p>

        <p className="filter-count">
          {collections.length} {localizedCopy(language, 'collection', 'كوليكشن')}
        </p>

        {collections.length > 0 ? (
          <Row className="g-3">
            {collections.map((product) => (
              <Col key={product.id} xs={6} sm={6} md={4} lg={3}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>
        ) : (
          <div className="empty-search-state">
            <p>{localizedCopy(language, 'No collections yet.', 'مفيش كوليكشنات لسه.')}</p>
          </div>
        )}
      </Container>
    </div>
  );
}
