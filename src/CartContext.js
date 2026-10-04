import React, { createContext, useContext, useState, useEffect } from 'react';
import { calculatePromo } from './utils/promotions';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(function () {
    const saved = localStorage.getItem('laz2a_cart');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  }); // Array of { product, quantity }

  useEffect(function () {
    localStorage.setItem('laz2a_cart', JSON.stringify(cart));
  }, [cart]);

  // Add a product to the cart (or increment quantity if already there)
  function addToCart(product) {
    setCart(function (prev) {
      const existing = prev.find(function (item) {
        return item.product.id === product.id;
      });
      if (existing) {
        return prev.map(function (item) {
          if (item.product.id === product.id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });
      }
      return [...prev, { product: product, quantity: 1 }];
    });
  }

  // Set a specific quantity (removes item if qty drops to 0)
  function updateQuantity(productId, newQty) {
    if (newQty <= 0) { removeFromCart(productId); return; }
    setCart(function (prev) {
      return prev.map(function (item) {
        if (item.product.id === productId) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  }

  // Remove an item completely
  function removeFromCart(productId) {
    setCart(function (prev) {
      return prev.filter(function (item) {
        return item.product.id !== productId;
      });
    });
  }

  // Clear the entire cart (called after order success)
  function clearCart() {
    setCart([]);
  }

  // Total sticker count across all items
  const totalQuantity = cart.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);

  // Derived pricing — recalculated whenever cart changes
  const promo = calculatePromo(totalQuantity, cart);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalQuantity,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        // Pricing
        subtotal:       promo.subtotal,
        discountAmount: promo.discountAmount,
        finalTotal:     promo.finalTotal,
        freeItems:      promo.freeItems,
        packagesCount:  promo.packagesCount,
        itemsToNextTier: promo.itemsToNextTier,
        nextTier:       promo.nextTier,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
