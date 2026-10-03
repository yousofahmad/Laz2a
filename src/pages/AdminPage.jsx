import React, { useState } from 'react';
import {
  Container, Form, Button, Table, Alert,
  Spinner, Badge, Collapse,
} from 'react-bootstrap';
import { FaLock, FaUnlock, FaChevronDown, FaChevronUp, FaRedo, FaInbox } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

// ── Hardcoded admin passcode ─────────────────────────────────────────────────
const ADMIN_PASSCODE = 'laz2a-admin';

// ── Helper: format ISO date to readable Arabic-friendly string ───────────────
function formatDate(isoString) {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('ar-EG', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

// ── Helper: human-readable delivery label ────────────────────────────────────
function deliveryLabel(method) {
  const labels = {
    ship_home:      'شحن للمنزل',
    obour_pickup:   'معاهد / جامعة العبور',
    metro_zaytoun:  'مترو حدائق الزيتون',
  };
  return labels[method] || method || '—';
}

// ── Row with expandable items ─────────────────────────────────────────────────
function OrderRow({ order, index }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <tr className="admin-order-row">
        <td className="text-muted" style={{ fontSize: '0.78rem' }}>#{order.id}</td>
        <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
          {formatDate(order.created_at)}
        </td>
        <td style={{ fontWeight: 600 }}>{order.customer_name}</td>
        <td style={{ direction: 'ltr', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.85rem' }}>
          {order.phone}
        </td>
        <td style={{ fontSize: '0.82rem' }}>{deliveryLabel(order.delivery_method)}</td>
        <td>
          <Badge className="admin-total-badge">
            {order.total_amount} جنيه
          </Badge>
        </td>
        <td>
          <Button
            size="sm"
            className="btn-admin-expand"
            onClick={function () { setOpen(!open); }}
            aria-expanded={open}
          >
            {open ? <FaChevronUp /> : <FaChevronDown />}
            <span className="me-1"> تفاصيل</span>
          </Button>
        </td>
      </tr>

      {/* Expandable details row */}
      {open && (
        <tr className="admin-detail-row">
          <td colSpan={7}>
            <Collapse in={open}>
              <div className="admin-detail-box">
                {/* Items list */}
                {order.items && order.items.length > 0 && (
                  <>
                    <p className="admin-detail-label">🧾 الاستيكرات:</p>
                    <ul className="admin-items-list">
                      {order.items.map(function (item, i) {
                        return (
                          <li key={i}>
                            <span className="item-id">#{item.id}</span>{' '}
                            {item.name}{' '}
                            <span className="item-qty">× {item.quantity}</span>{' '}
                            <span className="item-price">= {item.price} جنيه</span>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}

                {/* Notes */}
                {order.notes && (
                  <>
                    <p className="admin-detail-label" style={{ marginTop: '0.75rem' }}>
                      📝 ملاحظات:
                    </p>
                    <p className="admin-notes-text">{order.notes}</p>
                  </>
                )}

                {/* Address */}
                {order.address && (
                  <>
                    <p className="admin-detail-label" style={{ marginTop: '0.75rem' }}>
                      📍 العنوان:
                    </p>
                    <p className="admin-notes-text">{order.address}</p>
                  </>
                )}
              </div>
            </Collapse>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main AdminPage ─────────────────────────────────────────────────────────────
function AdminPage() {
  const [passcode, setPasscode]   = useState('');
  const [loggedIn, setLoggedIn]   = useState(false);
  const [loginError, setLoginError] = useState('');

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(false);
  const [fetchError, setFetchError] = useState('');

  // ── Login ──────────────────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    if (passcode !== ADMIN_PASSCODE) {
      setLoginError('كلمة السر غلط. حاول تاني.');
      return;
    }
    setLoggedIn(true);
    fetchOrders();
  }

  // ── Fetch orders from Supabase ─────────────────────────────────────────────
  async function fetchOrders() {
    setLoading(true);
    setFetchError('');

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      console.error('Supabase fetch error:', error);
      setFetchError('مش قادر يجيب الطلبات: ' + error.message);
      return;
    }

    setOrders(data || []);
  }

  // ── Login screen ───────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <FaLock style={{ fontSize: '2rem', color: 'var(--color-gold)', marginBottom: '1rem' }} />
          <h2 className="admin-login-title">لوحة التحكم</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            ادخل كلمة السر للدخول
          </p>

          {loginError && (
            <Alert variant="danger" style={{ fontSize: '0.85rem' }}>{loginError}</Alert>
          )}

          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder="كلمة السر"
                className="form-ctrl"
                value={passcode}
                onChange={function (e) {
                  setPasscode(e.target.value);
                  setLoginError('');
                }}
                autoFocus
              />
            </Form.Group>
            <Button type="submit" className="btn-submit">
              دخول
            </Button>
          </Form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────────────────
  return (
    <div className="admin-page">
      <Container fluid="xl">
        {/* Header */}
        <div className="admin-header">
          <div>
            <h2 className="admin-page-title">
              <FaUnlock style={{ marginLeft: '10px', color: 'var(--color-gold)' }} />
              لوحة التحكم — الطلبات
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              {orders.length} طلب مسجل
            </p>
          </div>
          <Button
            className="btn-admin-refresh"
            onClick={fetchOrders}
            disabled={loading}
          >
            <FaRedo style={{ marginLeft: '6px' }} />
            تحديث
          </Button>
        </div>

        {/* Error */}
        {fetchError && (
          <Alert variant="danger" style={{ fontSize: '0.85rem' }}>{fetchError}</Alert>
        )}

        {/* Loading spinner */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Spinner animation="border" style={{ color: 'var(--color-gold)' }} />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>جاري تحميل الطلبات…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && orders.length === 0 && !fetchError && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <FaInbox style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-muted)' }} />
            <p>مفيش طلبات لحد دلوقتي.</p>
          </div>
        )}

        {/* Orders table */}
        {!loading && orders.length > 0 && (
          <div className="admin-table-wrap">
            <Table responsive className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>التاريخ</th>
                  <th>الاسم</th>
                  <th>الهاتف</th>
                  <th>الاستلام</th>
                  <th>المبلغ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(function (order, index) {
                  return <OrderRow key={order.id} order={order} index={index} />;
                })}
              </tbody>
            </Table>
          </div>
        )}
      </Container>
    </div>
  );
}

export default AdminPage;
