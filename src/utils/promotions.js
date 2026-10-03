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
export function calculatePromo(totalQty, cart = []) {
  // 1. Group by category and find packages
  let packagesCount = 0;
  let remainingQty = 0;
  
  const catCounts = {};
  cart.forEach(function(item) {
    const cat = item.product.category_name_ar;
    catCounts[cat] = (catCounts[cat] || 0) + item.quantity;
  });

  Object.values(catCounts).forEach(function(qty) {
    packagesCount += Math.floor(qty / 15);
    remainingQty += qty % 15;
  });

  // Package discount: 15 stickers cost 150. Package price is 75. Discount per package = 75 EGP.
  const packageDiscount = packagesCount * 75;

  // 2. Apply general tiers on the remaining items
  const tier = TIERS.find(function (t) { return remainingQty >= t.minQty; });
  const tierFreeItems = tier ? tier.freeItems : 0;
  const tierDiscount = tierFreeItems * PRICE_PER_STICKER;

  // 3. Calculate totals
  const subtotal = totalQty * PRICE_PER_STICKER;
  const discountAmount = packageDiscount + tierDiscount;
  const finalTotal = subtotal - discountAmount;

  // How many more items until the next tier unlocks (based on remaining non-package items)
  const nextTier = TIERS.slice().reverse().find(function (t) { return t.minQty > remainingQty; });
  const itemsToNextTier = nextTier ? nextTier.minQty - remainingQty : null;

  return { 
    freeItems: tierFreeItems, 
    packagesCount,
    discountAmount, 
    subtotal, 
    finalTotal, 
    itemsToNextTier 
  };
}
