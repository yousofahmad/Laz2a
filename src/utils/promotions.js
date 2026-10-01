/**
 * Promotions logic for Lesa Las2a Sticker Shop.
 * Base price: 10 EGP per sticker.
 *
 * "Buy X, get Y free" tiers (cumulative — always applies the best matching tier).
 * The customer pays for X stickers and receives X + Y stickers total.
 */

export const BASE_PRICE = 10; // EGP

/**
 * Promotion tiers: { buy, free }
 * Sorted descending so we always match the highest qualifying tier first.
 */
const TIERS = [
  { buy: 200, free: 355 },
  { buy: 190, free: 330 },
  { buy: 180, free: 315 },
  { buy: 170, free: 290 },
  { buy: 160, free: 265 },
  { buy: 150, free: 240 },
  { buy: 140, free: 225 },
  { buy: 130, free: 210 },
  { buy: 120, free: 185 },
  { buy: 110, free: 160 },
  { buy: 100, free: 140 },
  { buy: 90,  free: 125 },
  { buy: 80,  free: 110 },
  { buy: 60,  free: 85  },
  { buy: 50,  free: 70  },
  { buy: 40,  free: 55  },
  { buy: 30,  free: 40  },
  { buy: 20,  free: 25  },
  { buy: 10,  free: 12  },
  { buy: 5,   free: 5   },
];

/**
 * Given the total number of stickers in the cart, returns:
 *   - paidQty    : how many stickers the customer actually pays for
 *   - freeQty    : how many stickers the customer gets for free
 *   - totalQty   : paidQty + freeQty (total stickers received)
 *   - totalPrice : paidQty * BASE_PRICE  (EGP)
 *   - tier       : the matched tier object, or null if no promo applies
 *
 * "Buy X, get Y free" means: customer puts X stickers in cart,
 * pays 10 EGP × X, and receives X + Y stickers.
 *
 * @param {number} cartQty - number of sticker units selected by the user
 * @returns {{ paidQty: number, freeQty: number, totalQty: number, totalPrice: number, tier: object|null }}
 */
export function calculatePromotion(cartQty) {
  const qty = Math.max(0, Math.floor(cartQty));

  const tier = TIERS.find((t) => qty >= t.buy) || null;

  const freeQty = tier ? tier.free : 0;
  const paidQty = qty;
  const totalQty = paidQty + freeQty;
  const totalPrice = paidQty * BASE_PRICE;

  return { paidQty, freeQty, totalQty, totalPrice, tier };
}

/**
 * Returns a human-readable summary string of the active promotion.
 * @param {object|null} tier
 * @returns {string}
 */
export function promoLabel(tier) {
  if (!tier) return '';
  return `🎉 Buy ${tier.buy}, get ${tier.free} FREE! (${tier.buy + tier.free} stickers total)`;
}
