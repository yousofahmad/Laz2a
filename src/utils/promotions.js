/**
 * promotions.js
 *
 * Tiers (total items in cart = pay X, get Y free):
 *   Cart >= 44 items  → 14 free → discount: 140 EGP
 *   Cart >= 29 items  → 9 free  → discount: 90 EGP
 *   Cart >= 14 items  → 4 free  → discount: 40 EGP
 *   Else              → 0 free  → discount: 0 EGP
 */

const PRICE_PER_STICKER = 10; // EGP — never changes

// Tiers ordered from highest to lowest so we always match the best deal
const TIERS = [
  { minQty: 44, freeItems: 14 },
  { minQty: 29, freeItems: 9  },
  { minQty: 14, freeItems: 4  },
];

/**
 * Given total quantity in cart, returns:
 *   { freeItems, discountAmount, subtotal, finalTotal }
 */
export function calculatePromo(totalQty) {
  // Find the best matching tier
  const tier = TIERS.find(function (t) { return totalQty >= t.minQty; });

  const freeItems      = tier ? tier.freeItems : 0;
  const discountAmount = freeItems * PRICE_PER_STICKER;
  const subtotal       = totalQty * PRICE_PER_STICKER;
  const finalTotal     = subtotal - discountAmount;

  // How many more items until the next tier unlocks
  const nextTier = TIERS.slice().reverse().find(function (t) { return t.minQty > totalQty; });
  const itemsToNextTier = nextTier ? nextTier.minQty - totalQty : null;

  return { freeItems, discountAmount, subtotal, finalTotal, itemsToNextTier };
}
