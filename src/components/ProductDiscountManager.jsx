import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Spinner, Table } from 'react-bootstrap';
import { FaRedo, FaSave, FaSearch, FaTag } from 'react-icons/fa';
import { useProductCatalog } from '../ProductCatalogContext';
import { isProductDiscountActive, getProductRegularPrice } from '../utils/productPricing';
import { localizedProductTitle } from '../utils/localization';
import { supabase } from '../supabaseClient';

const PAGE_SIZE = 25;
function dateTimeInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}

function draftFor(product, row) {
  return {
    basePrice: String(row?.unit_price ?? getProductRegularPrice(product)),
    discountPrice: row?.discount_price === null || row?.discount_price === undefined ? '' : String(row.discount_price),
    startsAt: dateTimeInputValue(row?.discount_starts_at),
    endsAt: dateTimeInputValue(row?.discount_ends_at),
  };
}

function money(value) {
  return `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 }).format(Number(value) || 0)} جنيه`;
}

function discountStatus(product, draft, discountPricingReady) {
  if (!draft?.discountPrice) return 'لا يوجد خصم';
  if (Number(draft.discountPrice) >= Number(draft.basePrice)) return 'سعر الخصم يجب أن يكون أقل';
  if (draft.startsAt && new Date(draft.startsAt).getTime() > Date.now()) return 'مجدول';
  if (draft.endsAt && new Date(draft.endsAt).getTime() <= Date.now()) return 'انتهى';
  if (!discountPricingReady) return 'محفوظ — بانتظار تفعيل التسعير الآمن';
  const candidate = {
    ...product,
    base_price: Number(draft.basePrice),
    discount_price: Number(draft.discountPrice),
    discount_active: true,
    discount_pricing_ready: true,
    discount_starts_at: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
    discount_ends_at: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
  };
  if (isProductDiscountActive(candidate)) return 'ظاهر الآن';
  return 'غير مفعّل';
}

function ProductDiscountManager() {
  const { products, refreshProducts, discountPricingReady } = useProductCatalog();
  const [drafts, setDrafts] = useState({});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadRows = useCallback(async () => {
    if (!supabase) {
      setError('اتصال Supabase غير مهيأ.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data, error: queryError } = await supabase.rpc('admin_list_catalog_products');
      if (queryError) {
        console.error('Could not load product pricing.');
        setError('تعذر تحميل الأسعار. يلزم إعداد دالة الإدارة الآمنة على catalog_products في Supabase، ثم أعد المحاولة.');
        return;
      }
      const rowsById = new Map((data || []).map((row) => [String(row.product_id), row]));
      setDrafts(Object.fromEntries(products.map((product) => [String(product.id), draftFor(product, rowsById.get(String(product.id)))])));
    } catch (_error) {
      setError('تعذر الاتصال بقاعدة البيانات لتحميل الأسعار.');
    } finally {
      setLoading(false);
    }
  }, [products]);

  useEffect(() => {
    loadRows();
  }, [loadRows]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ar');
    if (!normalized) return products;
    return products.filter((product) => [product.id, product.title, product.title_original, product.category_name_ar]
      .some((value) => String(value || '').toLocaleLowerCase('ar').includes(normalized)));
  }, [products, query]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const visibleProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  function updateDraft(productId, key, value) {
    setDrafts((current) => ({
      ...current,
      [String(productId)]: { ...(current[String(productId)] || {}), [key]: value },
    }));
    setNotice('');
  }

  async function saveProduct(product) {
    const idKey = String(product.id);
    const draft = drafts[idKey] || draftFor(product);
    const basePrice = Number(draft.basePrice);
    const discountPrice = draft.discountPrice === '' ? null : Number(draft.discountPrice);
    if (!Number.isFinite(basePrice) || basePrice < 0) {
      setError(`اكتب سعراً أصلياً صحيحاً للمنتج #${product.id}.`);
      return;
    }
    if (discountPrice !== null && (!Number.isFinite(discountPrice) || discountPrice < 0 || discountPrice >= basePrice)) {
      setError(`سعر الخصم للمنتج #${product.id} يجب أن يكون رقماً أقل من السعر الأصلي.`);
      return;
    }
    const startsAt = draft.startsAt ? new Date(draft.startsAt) : null;
    const endsAt = draft.endsAt ? new Date(draft.endsAt) : null;
    if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime())) || (startsAt && endsAt && endsAt <= startsAt)) {
      setError(`راجع موعد بداية ونهاية الخصم للمنتج #${product.id}.`);
      return;
    }

    setSavingId(idKey);
    setError('');
    setNotice('');
    try {
      const payload = {
        p_product_id: Number(product.id),
        p_unit_price: basePrice,
        p_discount_price: discountPrice,
        p_discount_starts_at: startsAt ? startsAt.toISOString() : null,
        p_discount_ends_at: endsAt ? endsAt.toISOString() : null,
        p_discount_active: discountPrice !== null,
      };
      const { error: saveError } = await supabase.rpc('admin_update_catalog_product', payload);
      if (saveError) {
        console.error('Could not save product pricing.');
        setError('تعذر حفظ التغيير. تحقق من إعداد دالة الإدارة الآمنة وصلاحية حسابك في admin_users.');
        return;
      }
      await refreshProducts();
      setNotice(`تم حفظ أسعار «${product.title || `المنتج ${product.id}`}».`);
    } catch (_error) {
      setError('تعذر الاتصال بقاعدة البيانات أثناء الحفظ. حاول مرة أخرى.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="admin-orders-panel admin-products-panel">
      <div className="admin-orders-heading">
        <div>
          <h2><FaTag /> أسعار المنتجات والخصومات</h2>
          <p>عدّل السعر الأصلي وسعر العرض، وحدد فترة الخصم عند الحاجة. اترك تاريخ البداية أو النهاية فارغاً ليكون الخصم فورياً أو بلا موعد انتهاء.</p>
        </div>
        <div className="admin-products-tools">
          <div className="admin-search-shell">
            <FaSearch />
            <Form.Control aria-label="ابحث عن منتج" placeholder="ابحث بالاسم أو رقم المنتج" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          </div>
          <Button type="button" className="admin-secondary-button" onClick={loadRows} disabled={loading}><FaRedo className={loading ? 'admin-spin' : ''} /> تحديث المنتجات</Button>
        </div>
      </div>

      {!discountPricingReady && <Alert variant="warning" className="admin-alert" role="status">التسعير المخفّض غير مفعّل للمتجر بعد. لا تعرض الخصومات للعملاء حتى تجهيز دوال التسعير الموثوقة في Supabase.</Alert>}

      {error && <Alert variant="danger" className="admin-alert" role="alert">{error}</Alert>}
      {notice && <Alert variant="success" className="admin-alert admin-product-success" role="status">{notice}</Alert>}

      {loading && products.length === 0 ? <div className="admin-inline-loading"><Spinner animation="border" /><span>جارٍ تحميل المنتجات…</span></div> : (
        <>
          <div className="admin-table-scroll">
            <Table responsive className="admin-orders-table admin-products-table">
              <thead><tr><th>المنتج</th><th>السعر الأصلي</th><th>سعر الخصم</th><th>يبدأ في (اختياري)</th><th>ينتهي في (اختياري)</th><th>الحالة</th><th>حفظ</th></tr></thead>
              <tbody>
                {visibleProducts.map((product) => {
                  const idKey = String(product.id);
                  const draft = drafts[idKey] || draftFor(product);
                  const status = discountStatus(product, draft, discountPricingReady);
                  const title = localizedProductTitle(product, 'ar');
                  return (
                    <tr key={idKey} className="admin-product-row">
                      <td><strong>{title}</strong><small>#{product.id} · {money(getProductRegularPrice(product))} السعر الحالي</small></td>
                      <td><Form.Control className="admin-product-input" type="number" min="0" step="0.01" aria-label={`السعر الأصلي للمنتج ${title}`} value={draft.basePrice} onChange={(event) => updateDraft(idKey, 'basePrice', event.target.value)} /></td>
                      <td><Form.Control className="admin-product-input" type="number" min="0" step="0.01" placeholder="بدون خصم" aria-label={`سعر الخصم للمنتج ${title}`} value={draft.discountPrice} onChange={(event) => updateDraft(idKey, 'discountPrice', event.target.value)} /></td>
                      <td><Form.Control className="admin-product-input admin-product-date" type="datetime-local" aria-label={`بداية الخصم للمنتج ${title}`} value={draft.startsAt || ''} onChange={(event) => updateDraft(idKey, 'startsAt', event.target.value)} /></td>
                      <td><Form.Control className="admin-product-input admin-product-date" type="datetime-local" aria-label={`نهاية الخصم للمنتج ${title}`} value={draft.endsAt || ''} onChange={(event) => updateDraft(idKey, 'endsAt', event.target.value)} /></td>
                      <td><span className={`admin-discount-status${status === 'ظاهر الآن' ? ' admin-discount-status--active' : ''}`}>{status}</span></td>
                      <td><Button type="button" className="admin-save-product-button" onClick={() => saveProduct(product)} disabled={savingId === idKey || loading}><FaSave /> {savingId === idKey ? 'جارٍ الحفظ…' : 'حفظ'}</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
          {visibleProducts.length === 0 && <div className="admin-empty-state"><span><FaSearch /></span><h3>لا توجد منتجات مطابقة</h3><p>جرّب البحث برقم المنتج أو جزء من اسمه.</p></div>}
          <div className="admin-products-pagination">
            <span>{new Intl.NumberFormat('ar-EG').format(filteredProducts.length)} منتج</span>
            <div>
              <Button type="button" className="admin-secondary-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>السابق</Button>
              <span>صفحة {new Intl.NumberFormat('ar-EG').format(page)} من {new Intl.NumberFormat('ar-EG').format(pageCount)}</span>
              <Button type="button" className="admin-secondary-button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)}>التالي</Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default ProductDiscountManager;
