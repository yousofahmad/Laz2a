import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { localizedCopy, useLanguage } from '../LanguageContext';

export default function NotFoundPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <Container className="text-center" style={{ padding: '6rem 1rem' }}>
        <FaSearch style={{ fontSize: '3rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '5rem', fontWeight: 'bold', color: 'var(--color-gold)' }}>404</h1>
        <h2>{localizedCopy(language, 'Page not found', 'الصفحة مش موجودة')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {localizedCopy(
            language,
            'The page you are looking for does not exist or was moved.',
            'الصفحة اللي بتدور عليها مش موجودة أو اتنقلت.'
          )}
        </p>
        <Button className="btn btn-metallic-gold mt-3 px-5 py-2" onClick={() => navigate('/')}>
          {localizedCopy(language, 'Back to the store', 'ارجع للمتجر')}
        </Button>
      </Container>
    </div>
  );
}
