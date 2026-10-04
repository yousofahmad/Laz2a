/**
 * promotions.js
 *
 * New Tiers (Individual Stickers Only):
 *   Buy 100 → get 55 free
 *   Buy 75  → get 35 free
 *   Buy 50  → get 20 free
 *   Buy 40  → get 15 free
 *   Buy 30  → get 10 free
 *   Buy 20  → get 5 free
 *   Buy 10  → get 2 free
 */

const PRICE_PER_STICKER = 10;

const TIERS = [
  { minQty: 155, freeItems: 55 }, // Pay 100, get 55 free = 155 total
  { minQty: 110, freeItems: 35 }, // Pay 75, get 35 free = 110 total
  { minQty: 70,  freeItems: 20 }, // Pay 50, get 20 free = 70 total
  { minQty: 55,  freeItems: 15 }, // Pay 40, get 15 free = 55 total
  { minQty: 40,  freeItems: 10 }, // Pay 30, get 10 free = 40 total
  { minQty: 25,  freeItems: 5  }, // Pay 20, get 5 free = 25 total
  { minQty: 12,  freeItems: 2  }, // Pay 10, get 2 free = 12 total
];

export function calculatePromo(totalQtyIgnored, cart = []) {
  let individualQty = 0;
  let collectionsTotal = 0;

  cart.forEach(function(item) {
    if (item.product.isCollection) {
      collectionsTotal += (item.product.price || 75) * item.quantity;
    } else {
      individualQty += item.quantity;
    }
  });

  const tier = TIERS.find(function(t) { return individualQty >= t.minQty; });
  const freeItems = tier ? tier.freeItems : 0;
  
  const individualDiscount = freeItems * PRICE_PER_STICKER;
  const individualBasePrice = individualQty * PRICE_PER_STICKER;
  const individualFinalPrice = individualBasePrice - individualDiscount;

  const finalTotal = individualFinalPrice + collectionsTotal;
  const subtotal = individualBasePrice + collectionsTotal; // raw price before discounts
  const discountAmount = individualDiscount; // collections are fixed-price, no "discount" math shown for them

  const nextTier = TIERS.slice().reverse().find(function(t) { return t.minQty > individualQty; });
  const itemsToNextTier = nextTier ? nextTier.minQty - individualQty : null;

  return { 
    freeItems, 
    discountAmount, 
    subtotal, 
    finalTotal, 
    itemsToNextTier,
    nextTier,
    individualQty
  };
}
