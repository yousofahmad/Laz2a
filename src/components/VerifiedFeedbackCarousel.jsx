import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaQuoteRight, FaStar } from 'react-icons/fa';
import { Container } from 'react-bootstrap';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { supabase } from '../supabaseClient';

function VerifiedFeedbackCarousel() {
  const { language } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedbackToken, setFeedbackToken] = useState('');

  useEffect(() => {
    try {
      setFeedbackToken(window.sessionStorage.getItem('laz2a_feedback_token') || '');
    } catch (_error) {
      setFeedbackToken('');
    }

    if (!supabase) return undefined;
    let mounted = true;
    async function loadReviews() {
      try {
        const { data, error } = await supabase
          .from('customer_feedback')
          .select('id, message, rating, created_at')
          .eq('is_verified', true)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(12);
        if (error) {
          console.warn('Verified customer feedback is not available yet.');
          return;
        }
        if (mounted) setReviews(data || []);
      } catch (_error) {
        console.warn('Could not load verified customer feedback.');
      }
    }
    loadReviews();
    const refreshId = window.setInterval(loadReviews, 60 * 1000);
    return () => {
      mounted = false;
      window.clearInterval(refreshId);
    };
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return undefined;
    const timerId = window.setInterval(() => setActiveIndex((current) => (current + 1) % reviews.length), 5000);
    return () => window.clearInterval(timerId);
  }, [reviews.length]);

  useEffect(() => {
    setActiveIndex((current) => (reviews.length ? current % reviews.length : 0));
  }, [reviews.length]);

  function move(direction) {
    if (!reviews.length) return;
    setActiveIndex((current) => (current + direction + reviews.length) % reviews.length);
  }

  const title = localizedCopy(language, 'From customers who bought', 'آراء من اشتروا فعلاً');
  const review = reviews[activeIndex];

  return (
    <section className="verified-feedback-section" aria-labelledby="verified-feedback-title">
      <Container fluid="xl">
        <div className="verified-feedback-heading">
          <div>
            <span className="verified-feedback-eyebrow">{localizedCopy(language, 'Verified purchases', 'تقييمات موثّقة بعد الشراء')}</span>
            <h2 id="verified-feedback-title">{title}</h2>
          </div>
          {feedbackToken && (
            <Link className="verified-feedback-cta" to={`/feedback?token=${encodeURIComponent(feedbackToken)}`}>
              {localizedCopy(language, 'Share your feedback', 'شارك رأيك بعد الشراء')}
            </Link>
          )}
        </div>

        {review ? (
          <div className="verified-feedback-carousel" aria-live="polite">
            {reviews.length > 1 && <button type="button" className="verified-feedback-arrow" aria-label={localizedCopy(language, 'Previous review', 'الرأي السابق')} onClick={() => move(-1)}><FaChevronRight /></button>}
            <article className="verified-feedback-card" key={review.id}>
              <FaQuoteRight className="verified-feedback-quote" aria-hidden="true" />
              <div className="verified-feedback-stars" aria-label={`${review.rating || 5} / 5`}>
                {Array.from({ length: 5 }, (_, index) => <FaStar key={index} className={index < (Number(review.rating) || 5) ? 'is-filled' : ''} />)}
              </div>
              <p className="verified-feedback-message">{review.message}</p>
              <div className="verified-feedback-author">
                <strong>{localizedCopy(language, 'Verified customer', 'عميل موثّق')}</strong>
                <span>{localizedCopy(language, 'Verified purchase', 'عملية شراء موثّقة')}</span>
              </div>
            </article>
            {reviews.length > 1 && <button type="button" className="verified-feedback-arrow" aria-label={localizedCopy(language, 'Next review', 'الرأي التالي')} onClick={() => move(1)}><FaChevronLeft /></button>}
            {reviews.length > 1 && <div className="verified-feedback-dots" aria-label={localizedCopy(language, 'Review position', 'موضع الرأي')}>{reviews.map((item, index) => <button key={item.id} type="button" aria-label={`${index + 1}`} aria-current={index === activeIndex ? 'true' : undefined} className={index === activeIndex ? 'active' : ''} onClick={() => setActiveIndex(index)} />)}</div>}
          </div>
        ) : (
          <div className="verified-feedback-empty">{localizedCopy(language, 'Verified customer reviews will appear here after they are submitted.', 'آراء المشترين الموثّقة هتظهر هنا بعد ما يشاركوا تقييمهم.')}</div>
        )}
      </Container>
    </section>
  );
}

export default VerifiedFeedbackCarousel;
