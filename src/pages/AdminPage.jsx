import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import {
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaRedo,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaShoppingBag,
  FaWallet,
} from 'react-icons/fa';
import { isSupabaseConfigured, supabase } from '../supabaseClient';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatMoney(value) {
  return `${new Intl.NumberFormat('ar-EG').format(Number(value) || 0)} جنيه`;
}

function deliveryLabel(method) {
  const labels = {
    ship_home: 'شحن للمنزل',
    obour_pickup: 'معاهد / جامعة العبور (طلب سابق)',
    obour_institutes: 'معاهد العبور',
    obour_university: 'جامعة العبور',
    helwan_university: 'جامعة حلوان',
    ain_shams_university: 'جامعة عين شمس',
    metro_station: 'أقرب محطة مترو',
    metro_zaytoun: 'مترو حدائق الزيتون (طلب سابق)',
  };
  return labels[method] || method || '—';
}

function AdminBrand({ compact = false }) {
  return (
    <div className={compact ? 'admin-brand admin-brand--compact' : 'admin-brand'}>
      <img className="admin-brand-logo" src="/logo.webp" alt="Laz2a" />
      {!compact && <div><span className="admin-brand-name">Laz2a</span><span className="admin-brand-caption">إدارة المتجر</span></div>}
    </div>
  );
}

function AdminLogin({ error, busy, onLogin, onRequestReset }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (mode === 'login') {
      await onLogin(email.trim(), password);
      return;
    }
    const result = await onRequestReset(email.trim());
    if (result) setResetSent(true);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setResetSent(false);
  }

  return (
    <main className="admin-auth-layout" dir="rtl">
      <section className="admin-welcome-panel">
        <AdminBrand />
        <div className="admin-welcome-copy">
          <span className="admin-eyebrow"><FaShieldAlt /> مساحة إدارية محمية</span>
          <h1>كل طلباتك،<br /><span>في مكان واحد.</span></h1>
          <p>تابع الطلبات وتفاصيل العملاء من لوحة مصممة لتكون واضحة ومريحة، حتى في الوضع الداكن.</p>
        </div>
        <div className="admin-trust-note"><span className="admin-trust-icon"><FaLock /></span><span><strong>دخول آمن</strong><small>تتم المصادقة عبر Supabase</small></span></div>
        <div className="admin-panel-orb admin-panel-orb--one" />
        <div className="admin-panel-orb admin-panel-orb--two" />
      </section>

      <section className="admin-auth-card" aria-labelledby="admin-auth-title">
        <AdminBrand compact />
        {resetSent ? (
          <div className="admin-auth-content">
            <div className="admin-auth-icon admin-auth-icon--success"><FaEnvelope /></div>
            <h2 id="admin-auth-title">راجع بريدك الإلكتروني</h2>
            <p className="admin-auth-description">إذا كان البريد مسجلاً، ستصلك رسالة فيها رابط آمن لإعادة تعيين كلمة المرور.</p>
            <Button type="button" className="admin-primary-button" onClick={() => switchMode('login')}>العودة لتسجيل الدخول <FaArrowLeft /></Button>
          </div>
        ) : (
          <div className="admin-auth-content">
            <div className="admin-auth-icon">{mode === 'login' ? <FaLock /> : <FaEnvelope />}</div>
            <h2 id="admin-auth-title">{mode === 'login' ? 'مرحباً بعودتك' : 'استعادة كلمة المرور'}</h2>
            <p className="admin-auth-description">{mode === 'login' ? 'سجّل الدخول لمتابعة طلبات المتجر.' : 'اكتب بريد حساب الإدارة وسنرسل لك رابطاً لتعيين كلمة مرور جديدة.'}</p>
            {error && <Alert variant="danger" className="admin-alert" role="alert">{error}</Alert>}

            <Form onSubmit={handleSubmit} className="admin-form">
              <Form.Group className="admin-field">
                <Form.Label htmlFor="admin-email">البريد الإلكتروني</Form.Label>
                <div className="admin-input-shell">
                  <FaEnvelope aria-hidden="true" />
                  <Form.Control id="admin-email" type="email" className="admin-input" placeholder="name@example.com" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required dir="ltr" disabled={busy} />
                </div>
              </Form.Group>

              {mode === 'login' && (
                <Form.Group className="admin-field">
                  <div className="admin-label-row">
                    <Form.Label htmlFor="admin-password">كلمة المرور</Form.Label>
                    <button type="button" className="admin-text-button" onClick={() => switchMode('forgot')}>نسيت كلمة المرور؟</button>
                  </div>
                  <div className="admin-input-shell">
                    <FaLock aria-hidden="true" />
                    <Form.Control id="admin-password" type={showPassword ? 'text' : 'password'} className="admin-input" placeholder="أدخل كلمة المرور" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required dir="ltr" disabled={busy} />
                    <button type="button" className="admin-password-toggle" aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
                  </div>
                </Form.Group>
              )}

              <Button type="submit" className="admin-primary-button" disabled={busy || (mode === 'login' && !password)}>
                {busy ? <><Spinner size="sm" animation="border" /> جارٍ المعالجة…</> : (mode === 'login' ? 'تسجيل الدخول' : 'إرسال رابط الاستعادة')}
              </Button>
            </Form>

            {mode === 'forgot' && <button type="button" className="admin-back-link" onClick={() => switchMode('login')}><FaArrowLeft /> العودة لتسجيل الدخول</button>}
            <p className="admin-auth-footnote"><FaShieldAlt /> لا تشارك بيانات دخول الإدارة مع أي شخص.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function OrderRow({ order }) {
  const [expanded, setExpanded] = useState(false);
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <>
      <tr className="admin-order-row">
        <td><span className="admin-order-id">#{order.id}</span></td>
        <td className="admin-date-cell">{formatDate(order.created_at)}</td>
        <td className="admin-customer-cell">{order.customer_name || '—'}</td>
        <td><a className="admin-phone" href={`tel:${order.phone || ''}`} dir="ltr">{order.phone || '—'}</a></td>
        <td><span className="admin-delivery-pill">{order.delivery_method === 'metro_station' && order.metro_station ? `مترو — ${order.metro_station}` : deliveryLabel(order.delivery_method)}</span></td>
        <td><strong className="admin-order-total">{formatMoney(order.total_amount)}</strong></td>
        <td><button type="button" className="admin-details-button" aria-expanded={expanded} onClick={() => setExpanded((open) => !open)}>{expanded ? 'إخفاء' : 'التفاصيل'} {expanded ? <FaChevronUp /> : <FaChevronDown />}</button></td>
      </tr>
      {expanded && (
        <tr className="admin-expanded-row">
          <td colSpan={7}>
            <div className="admin-order-details">
              <div className="admin-detail-section">
                <h3>المنتجات</h3>
                {items.length ? <ul className="admin-items-list">{items.map((item, index) => <li key={`${item.id || 'item'}-${index}`}><span>{item.name || `منتج ${item.id || ''}`}</span><span>× {item.quantity || 1}</span><strong>{formatMoney(item.price)}</strong></li>)}</ul> : <p className="admin-empty-detail">لا توجد تفاصيل منتجات لهذا الطلب.</p>}
              </div>
              {order.coupon_code && (
                <div className="admin-detail-section admin-coupon-section">
                  <h3>خصم الكوبون</h3>
                  <p><strong>{order.coupon_code}</strong> — {order.coupon_percent}% (خصم {formatMoney(order.coupon_discount_amount)} جنيه)</p>
                </div>
              )}
              {order.address && <div className="admin-detail-section"><h3>العنوان</h3><p>{order.address}</p></div>}
              {order.notes && <div className="admin-detail-section"><h3>ملاحظات</h3><p>{order.notes}</p></div>}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function AdminPage() {
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthError('تعذر التحقق من جلسة الدخول. حاول مرة أخرى.');
      setSession(data?.session || null);
      setAuthReady(true);
    }).catch(() => {
      if (mounted) {
        setAuthError('تعذر الاتصال بخدمة تسجيل الدخول. حاول مرة أخرى.');
        setAuthReady(true);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) setSession(nextSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setFetchError('');
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Could not load admin orders.');
        setFetchError('تعذر تحميل الطلبات. تحقق من اتصال قاعدة البيانات وسياسة صلاحية قراءة الطلبات لحساب الإدارة.');
        return;
      }
      setOrders(data || []);
    } catch (_error) {
      setFetchError('تعذر الاتصال بقاعدة البيانات. تحقق من الاتصال ثم أعد المحاولة.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchOrders();
    else setOrders([]);
  }, [session, fetchOrders]);

  async function handleLogin(email, password) {
    if (!supabase) return;
    setAuthError('');
    setAuthReady(false);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError('تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور وحاول مرة أخرى.');
    } catch (_error) {
      setAuthError('تعذر الاتصال بخدمة تسجيل الدخول. حاول مرة أخرى.');
    } finally {
      setAuthReady(true);
    }
  }

  async function handleRequestReset(email) {
    if (!supabase) return false;
    setAuthError('');
    setAuthReady(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/reset-password` });
      if (error) {
        setAuthError('تعذر إرسال رسالة الاستعادة. تأكد من إعداد رابط إعادة التوجيه في Supabase وحاول مرة أخرى.');
        return false;
      }
      return true;
    } catch (_error) {
      setAuthError('تعذر الاتصال بخدمة البريد. حاول مرة أخرى لاحقاً.');
      return false;
    } finally {
      setAuthReady(true);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setOrders([]);
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('ar');
    if (!normalizedQuery) return orders;
    return orders.filter((order) => [order.id, order.customer_name, order.phone].some((value) => String(value || '').toLocaleLowerCase('ar').includes(normalizedQuery)));
  }, [orders, query]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0), [orders]);

  if (!isSupabaseConfigured) {
    return <div className="admin-shell" dir="rtl"><section className="admin-message-card"><AdminBrand /><div className="admin-auth-icon"><FaLock /></div><h1>إعداد الاتصال غير مكتمل</h1><p>أضف عنوان Supabase ومفتاح النشر العام في متغيرات البيئة الخاصة بالبناء، ثم أعد النشر.</p></section></div>;
  }
  if (!authReady && !session) return <div className="admin-shell admin-loading-screen"><Spinner animation="border" role="status" /><span>جارٍ التحقق من الجلسة…</span></div>;
  if (!session) return <div className="admin-shell"><AdminLogin error={authError} busy={!authReady} onLogin={handleLogin} onRequestReset={handleRequestReset} /></div>;

  return (
    <main className="admin-dashboard" dir="rtl">
      <div className="admin-dashboard-inner">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-heading"><AdminBrand compact /><span className="admin-heading-divider" /><div><span className="admin-eyebrow">نظرة عامة</span><h1>الطلبات</h1></div></div>
          <div className="admin-header-actions">
            <Button type="button" className="admin-secondary-button" onClick={fetchOrders} disabled={loading}><FaRedo className={loading ? 'admin-spin' : ''} /> تحديث</Button>
            <Button type="button" className="admin-logout-button" onClick={handleLogout}><FaSignOutAlt /> تسجيل الخروج</Button>
          </div>
        </header>

        <section className="admin-dashboard-intro"><div><h2>أهلاً بك في لوحة الإدارة</h2><p>ملخص سريع لطلبات متجر Laz2a.</p></div><span className="admin-secure-badge"><FaShieldAlt /> اتصال محمي</span></section>
        <section className="admin-stat-grid" aria-label="ملخص الطلبات">
          <article className="admin-stat-card"><span className="admin-stat-icon"><FaShoppingBag /></span><div><span>إجمالي الطلبات</span><strong>{new Intl.NumberFormat('ar-EG').format(orders.length)}</strong></div></article>
          <article className="admin-stat-card"><span className="admin-stat-icon admin-stat-icon--gold"><FaWallet /></span><div><span>إجمالي المبيعات المسجلة</span><strong>{formatMoney(totalRevenue)}</strong></div></article>
        </section>

        <section className="admin-orders-panel">
          <div className="admin-orders-heading"><div><h2>كل الطلبات</h2><p>{new Intl.NumberFormat('ar-EG').format(orders.length)} طلب مسجل</p></div><div className="admin-search-shell"><FaSearch /><Form.Control aria-label="ابحث بالاسم أو الهاتف أو رقم الطلب" placeholder="ابحث بالاسم أو الهاتف أو رقم الطلب" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
          {fetchError && <Alert variant="danger" className="admin-alert" role="alert">{fetchError}</Alert>}
          {loading && orders.length === 0 ? <div className="admin-inline-loading"><Spinner animation="border" /><span>جارٍ تحميل الطلبات…</span></div> : filteredOrders.length === 0 ? <div className="admin-empty-state"><span><FaShoppingBag /></span><h3>{query ? 'لا توجد نتائج مطابقة' : 'لا توجد طلبات حتى الآن'}</h3><p>{query ? 'جرّب كلمة بحث أو رقم هاتف مختلفاً.' : 'ستظهر الطلبات الجديدة هنا بعد تسجيلها.'}</p></div> : (
            <div className="admin-table-scroll"><Table responsive className="admin-orders-table"><thead><tr><th>رقم الطلب</th><th>التاريخ</th><th>العميل</th><th>الهاتف</th><th>الاستلام</th><th>الإجمالي</th><th aria-label="الإجراءات" /></tr></thead><tbody>{filteredOrders.map((order) => <OrderRow key={order.id} order={order} />)}</tbody></Table></div>
          )}
        </section>
        <footer className="admin-dashboard-footer"><FaShieldAlt /> بيانات الطلبات متاحة لحسابات الإدارة المصرّح بها فقط.</footer>
      </div>
    </main>
  );
}

export default AdminPage;
