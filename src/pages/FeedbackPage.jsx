import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Form, Spinner } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle, FaStar } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import { useLanguage, localizedCopy } from '../LanguageContext';

function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { language } = useLanguage();
  const [verification, setVerification] = useState('checking');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setVerification('missing');
      return () => { mounted = false; };
    }
    if (!supabase) {
      setVerification('unavailable');
      return () => { mounted = false; };
    }
    setVerification('checking');
    supabase.rpc('verify_feedback_token', { p_token: token }).then(({ data, error: verifyError }) => {
      if (!mounted) return;
      const result = Array.isArray(data) ? data[0] : data;
      if (verifyError) {
        setVerification('unavailable');
        return;
      }
      if (result === true || result?.valid === true) setVerification('verified');
      else setVerification('invalid');
    }).catch(() => {
      if (mounted) setVerification('unavailable');
    });
    return () => { mounted = false; };
  }, [token]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const cleanMessage = message.trim();
    if (cleanMessage.length < 10) {
      setError(localizedCopy(language, 'Please write at least 10 characters.', 'اكتب رأيك في ١٠ حروف على الأقل.'));
      return;
    }
    if (!supabase || verification !== 'verified') return;

    setSaving(true);
    try {
      const { data, error: submitError } = await supabase.rpc('submit_verified_feedback', {
        p_token: token,
        p_rating: rating,
        p_message: cleanMessage,
      });
      const result = Array.isArray(data) ? data[0] : data;
      if (submitError || (result && result.success === false)) {
        setError(localizedCopy(language, 'This purchase link could not be used. It may already have submitted feedback.', 'تعذر استخدام رابط الشراء؛ ربما تم إرسال الرأي من قبل.'));
        return;
      }
      setSubmitted(true);
      try {
        if (window.sessionStorage.getItem('laz2a_feedback_token') === token) window.sessionStorage.removeItem('laz2a_feedback_token');
      } catch (_error) {
        // The server remains the source of truth if session storage is unavailable.
      }
    } catch (_error) {
      setError(localizedCopy(language, 'Feedback could not be sent right now. Please try again later.', 'تعذر إرسال الرأي الآن. حاول مرة أخرى لاحقاً.'));
    } finally {
      setSaving(false);
    }
  }

  const text = (english, arabic) => localizedCopy(language, english, arabic);

  return (
    <main className="feedback-page" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Container>
        <section className="feedback-page-card">
          <Link className="feedback-back-link" to="/"><FaArrowRight /> {text('Back to the store', 'العودة للمتجر')}</Link>
          {submitted ? (
            <div className="feedback-result-state">
              <FaCheckCircle className="feedback-result-icon" />
              <h1>{text('Thank you for sharing your experience!', 'شكراً إنك شاركت تجربتك!')}</h1>
              <p>{text('Your feedback is linked to a verified purchase.', 'رأيك اتسجل كعملية شراء موثّقة.')}</p>
              <Link className="verified-feedback-cta" to="/">{text('Return to the store', 'العودة للمتجر')}</Link>
            </div>
          ) : verification === 'checking' ? (
            <div className="feedback-result-state"><Spinner animation="border" role="status" /><p>{text('Checking your purchase link…', 'جارٍ التحقق من رابط الشراء…')}</p></div>
          ) : verification === 'missing' || verification === 'invalid' ? (
            <div className="feedback-result-state">
              <h1>{text('Feedback is available after a purchase', 'إضافة الرأي متاحة بعد الشراء')}</h1>
              <p>{verification === 'missing' ? text('Open the private feedback link shown on your order confirmation. This page does not accept unverified reviews.', 'افتح رابط الرأي الخاص الظاهر في تأكيد طلبك. الصفحة لا تقبل آراء من غير عملية شراء موثّقة.') : text('This purchase link is invalid, expired, or has already been used.', 'رابط الشراء غير صالح أو انتهت صلاحيته أو تم استخدامه من قبل.')}</p>
              <Link className="verified-feedback-cta" to="/">{text('Back to the store', 'العودة للمتجر')}</Link>
            </div>
          ) : verification === 'unavailable' ? (
            <div className="feedback-result-state">
              <h1>{text('Purchase verification is not ready yet', 'التحقق من الشراء غير مهيأ بعد')}</h1>
              <p>{text('The store needs its Supabase verification functions before it can accept feedback securely.', 'المتجر يحتاج إعداد دوال التحقق في Supabase قبل استقبال الآراء بشكل آمن.')}</p>
              <Link className="verified-feedback-cta" to="/">{text('Back to the store', 'العودة للمتجر')}</Link>
            </div>
          ) : (
            <>
              <span className="feedback-page-eyebrow">{text('Verified purchase', 'عملية شراء موثّقة')}</span>
              <h1>{text('How was your Laz2a order?', 'إيه رأيك في طلب Laz2a؟')}</h1>
              <p className="feedback-page-intro">{text('Your review is tied to the purchase link from your order confirmation.', 'رأيك مرتبط برابط الشراء الموجود في تأكيد الطلب.')}</p>
              {error && <Alert variant="danger" role="alert">{error}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{text('Your rating', 'تقييمك')}</Form.Label>
                  <div className="feedback-rating-picker" role="radiogroup" aria-label={text('Choose a rating', 'اختار التقييم')}>
                    {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" role="radio" aria-checked={rating === value} aria-label={`${value} / 5`} className={value <= rating ? 'active' : ''} onClick={() => setRating(value)}><FaStar /></button>)}
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>{text('Your experience', 'تجربتك')}</Form.Label>
                  <Form.Control as="textarea" rows={5} maxLength={1000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={text('Tell us what you liked about your order…', 'احكيلنا إيه اللي عجبك في طلبك…')} required />
                  <small>{new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(message.length)} / 1000</small>
                </Form.Group>
                <Button type="submit" className="feedback-submit-button" disabled={saving || message.trim().length < 10}>
                  {saving ? <><Spinner size="sm" animation="border" /> {text('Sending…', 'جارٍ الإرسال…')}</> : text('Send verified feedback', 'إرسال الرأي الموثّق')}
                </Button>
              </Form>
            </>
          )}
        </section>
      </Container>
    </main>
  );
}

export default FeedbackPage;
