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
  { minQty: 100, freeItems: 55 },
  { minQty: 75,  freeItems: 35 },
  { minQty: 50,  freeItems: 20 },
  { minQty: 40,  freeItems: 15 },
  { minQty: 30,  freeItems: 10 },
  { minQty: 20,  freeItems: 5  },
  { minQty: 10,  freeItems: 2  },
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
    individualQty
  };
}
