import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaShieldAlt } from 'react-icons/fa';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [isRecoveryFlow, setIsRecoveryFlow] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return undefined;
    }
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      setHasSession(Boolean(session));
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryFlow(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setHasSession(Boolean(data?.session));
      setReady(true);
    }).catch(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('اختر كلمة مرور لا تقل عن 8 أحرف.');
      return;
    }
    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين.');
      return;
    }
    if (!supabase || !hasSession || !isRecoveryFlow) {
      setError('رابط الاستعادة غير صالح أو انتهت صلاحيته. اطلب رابطاً جديداً.');
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError('تعذر تحديث كلمة المرور. اطلب رابط استعادة جديداً وحاول مرة أخرى.');
        return;
      }
      await supabase.auth.signOut();
      setComplete(true);
    } catch (_updateError) {
      setError('تعذر الاتصال بخدمة المصادقة. حاول مرة أخرى.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell admin-reset-shell" dir="rtl">
      <section className="admin-reset-card" aria-labelledby="reset-title">
        <Link to="/admin" className="admin-reset-brand"><img src="/logo.webp" alt="Laz2a" /><span>Laz2a <small>إدارة المتجر</small></span></Link>
        {!isSupabaseConfigured ? (
          <div className="admin-auth-content"><div className="admin-auth-icon"><FaLock /></div><h1 id="reset-title">إعداد الاتصال غير مكتمل</h1><p className="admin-auth-description">أضف إعدادات Supabase العامة في متغيرات البيئة ثم أعد النشر.</p></div>
        ) : !ready ? (
          <div className="admin-inline-loading"><Spinner animation="border" /><span>جارٍ التحقق من رابط الاستعادة…</span></div>
        ) : complete ? (
          <div className="admin-auth-content"><div className="admin-auth-icon admin-auth-icon--success"><FaCheckCircle /></div><h1 id="reset-title">تم تحديث كلمة المرور</h1><p className="admin-auth-description">يمكنك الآن الدخول إلى لوحة الإدارة باستخدام كلمة المرور الجديدة.</p><Button type="button" className="admin-primary-button" onClick={() => navigate('/admin', { replace: true })}>العودة لتسجيل الدخول</Button></div>
        ) : !hasSession || !isRecoveryFlow ? (
          <div className="admin-auth-content"><div className="admin-auth-icon"><FaLock /></div><h1 id="reset-title">رابط الاستعادة غير صالح</h1><p className="admin-auth-description">قد يكون الرابط انتهت صلاحيته أو تم استخدامه من قبل. اطلب رسالة جديدة ثم افتح أحدث رابط وصل إليك.</p><Link to="/admin" className="admin-primary-button admin-link-button">العودة وطلب رابط جديد</Link></div>
        ) : (
          <div className="admin-auth-content">
            <div className="admin-auth-icon"><FaLock /></div>
            <h1 id="reset-title">تعيين كلمة مرور جديدة</h1>
            <p className="admin-auth-description">استخدم كلمة مرور قوية لا تقل عن 8 أحرف.</p>
            {error && <Alert variant="danger" className="admin-alert" role="alert">{error}</Alert>}
            <Form onSubmit={handleSubmit} className="admin-form">
              <Form.Group className="admin-field">
                <Form.Label htmlFor="new-password">كلمة المرور الجديدة</Form.Label>
                <div className="admin-input-shell">
                  <FaLock aria-hidden="true" />
                  <Form.Control id="new-password" type={showPassword ? 'text' : 'password'} className="admin-input" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required disabled={busy} dir="ltr" />
                  <button type="button" className="admin-password-toggle" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                </div>
              </Form.Group>
              <Form.Group className="admin-field">
                <Form.Label htmlFor="confirm-password">تأكيد كلمة المرور</Form.Label>
                <div className="admin-input-shell">
                  <FaLock aria-hidden="true" />
                  <Form.Control id="confirm-password" type={showConfirmPassword ? 'text' : 'password'} className="admin-input" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required disabled={busy} dir="ltr" />
                  <button type="button" className="admin-password-toggle" aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowConfirmPassword((visible) => !visible)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
                </div>
              </Form.Group>
              <Button type="submit" className="admin-primary-button" disabled={busy}>{busy ? <><Spinner size="sm" animation="border" /> جارٍ التحديث…</> : 'حفظ كلمة المرور الجديدة'}</Button>
            </Form>
            <p className="admin-auth-footnote"><FaShieldAlt /> لن نعرض كلمة المرور أو نرسلها بالبريد.</p>
          </div>
        )}
      </section>
    </main>
  );
}

export default ResetPasswordPage;
