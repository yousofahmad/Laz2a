import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import localCatalog from './data/catalog.json';
import { supabase } from './supabaseClient';

const ProductCatalogContext = createContext({
  products: localCatalog,
  discountPricingReady: false,
  refreshProducts: async () => {},
});

function applyPricingRows(products, rows, discountPricingReady) {
  const rowByProductId = new Map((rows || []).map((row) => [String(row.product_id), row]));
  return products.map((product) => {
    const row = rowByProductId.get(String(product.id));
    if (!row) return product;
    const unitPrice = Number(row.unit_price);
    return {
      ...product,
      ...(Number.isFinite(unitPrice) && unitPrice >= 0 ? { base_price: unitPrice } : {}),
      discount_pricing_ready: discountPricingReady,
      ...(discountPricingReady ? {
        discount_price: row.discount_price === null || row.discount_price === undefined ? null : Number(row.discount_price),
        discount_starts_at: row.discount_starts_at || null,
        discount_ends_at: row.discount_ends_at || null,
        discount_active: row.discount_active === true,
      } : {
        discount_price: null,
        discount_starts_at: null,
        discount_ends_at: null,
        discount_active: false,
      }),
    };
  });
}

function samePricing(left, right) {
  if (left.length !== right.length) return false;
  return left.every((product, index) => {
    const next = right[index];
    return String(product.id) === String(next.id)
      && product.base_price === next.base_price
      && product.discount_price === next.discount_price
      && product.discount_starts_at === next.discount_starts_at
      && product.discount_ends_at === next.discount_ends_at
      && product.discount_active === next.discount_active
      && product.discount_pricing_ready === next.discount_pricing_ready;
  });
}

export function ProductCatalogProvider({ children }) {
  const [products, setProducts] = useState(localCatalog);
  const [discountPricingReady, setDiscountPricingReady] = useState(false);

  const refreshProducts = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.rpc('get_storefront_catalog_prices');
      if (error) {
        // No direct browser access to catalog_products; until the safe RPC exists, show local regular prices only.
        console.warn('Trusted storefront pricing RPC is not available; using local regular prices.');
        setDiscountPricingReady(false);
        setProducts((current) => (samePricing(current, localCatalog) ? current : localCatalog));
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;
      const rows = Array.isArray(result?.products) ? result.products : [];
      // This flag must only be true after _laz2a_order_totals (and therefore both coupon preview and submit_order) use the same active-discount rule.
      const serverPricingReady = result?.discount_pricing_enabled === true;
      const nextProducts = applyPricingRows(localCatalog, rows, serverPricingReady);
      setDiscountPricingReady(serverPricingReady);
      setProducts((current) => (samePricing(current, nextProducts) ? current : nextProducts));
    } catch (_error) {
      console.warn('Could not refresh trusted product pricing; using local regular prices.');
      setDiscountPricingReady(false);
      setProducts((current) => (samePricing(current, localCatalog) ? current : localCatalog));
    }
  }, []);

  useEffect(() => {
    refreshProducts();
    if (!supabase) return undefined;
    const intervalId = window.setInterval(refreshProducts, 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [refreshProducts]);

  return (
    <ProductCatalogContext.Provider value={{ products, discountPricingReady, refreshProducts }}>
      {children}
    </ProductCatalogContext.Provider>
  );
}

export function useProductCatalog() {
  return useContext(ProductCatalogContext);
}
