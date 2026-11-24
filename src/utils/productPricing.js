const DEFAULT_INDIVIDUAL_PRICE = 10;
const DEFAULT_COLLECTION_PRICE = 75;

export function getProductRegularPrice(product) {
  if (!product) return 0;

  const configuredPrice = product.base_price ?? product.price;
  if (configuredPrice !== undefined && configuredPrice !== null && configuredPrice !== '') {
    const numericPrice = Number(configuredPrice);
    if (Number.isFinite(numericPrice) && numericPrice >= 0) return numericPrice;
  }

  return product.isCollection ? DEFAULT_COLLECTION_PRICE : DEFAULT_INDIVIDUAL_PRICE;
}

export function isProductDiscountActive(product, now = Date.now()) {
  if (!product || product.discount_pricing_ready !== true || product.discount_active !== true) return false;

  const regularPrice = getProductRegularPrice(product);
  const discountPrice = Number(product.discount_price);
  if (!Number.isFinite(discountPrice) || discountPrice < 0 || discountPrice >= regularPrice) return false;

  if (product.discount_starts_at) {
    const startsAt = new Date(product.discount_starts_at).getTime();
    if (!Number.isFinite(startsAt) || now < startsAt) return false;
  }
  if (product.discount_ends_at) {
    const endsAt = new Date(product.discount_ends_at).getTime();
    if (!Number.isFinite(endsAt) || now >= endsAt) return false;
  }

  return true;
}

export function getProductUnitPrice(product) {
  if (isProductDiscountActive(product)) return Number(product.discount_price);
  return getProductRegularPrice(product);
}

export function getProductDiscountPercent(product) {
  if (!isProductDiscountActive(product)) return 0;
  const regularPrice = getProductRegularPrice(product);
  if (regularPrice <= 0) return 0;
  return Math.round((1 - Number(product.discount_price) / regularPrice) * 100);
}
