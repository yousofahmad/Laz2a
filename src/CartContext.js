import React, { createContext, useContext, useState, useCallback } from 'react';
import { calculatePromotion } from './utils/promotions';

const CartContext = createContext(null);

/**
 * CartProvider wraps the app and exposes the cart state + actions.
 *
 * Cart shape:
 *   items: Array<{ id, name, image, quantity }>
 *
 * Derived values (re-computed on every render from promotions.js):
 *   totalQty    – stickers the customer will actually receive
 *   paidQty     – stickers the customer is paying for
 *   freeQty     – stickers earned for free
 *   totalPrice  – amount due in EGP
 *   activeTier  – matched promotion tier (or null)
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const paidQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const promo   = calculatePromotion(paidQty);

  // ── Actions ──────────────────────────────────────────────────────────────

  /** Add a sticker to cart (or increment its quantity). */
  const addItem = useCallback((sticker) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === sticker.id);
      if (existing) {
        return prev.map((i) =>
          i.id === sticker.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...sticker, quantity: 1 }];
    });
  }, []);

  /** Set a specific quantity for a cart item (removes it if qty <= 0). */
  const setQuantity = useCallback((id, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.id !== id);
      return prev.map((i) => (i.id === id ? { ...i, quantity } : i));
    });
  }, []);

  /** Remove an item entirely from the cart. */
  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  /** Empty the entire cart. */
  const clearCart = useCallback(() => setItems([]), []);

  const value = {
    items,
    // Promo-derived values
    paidQty:    promo.paidQty,
    freeQty:    promo.freeQty,
    totalQty:   promo.totalQty,
    totalPrice: promo.totalPrice,
    activeTier: promo.tier,
    // Actions
    addItem,
    setQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Convenience hook — throws if used outside <CartProvider>. */
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
