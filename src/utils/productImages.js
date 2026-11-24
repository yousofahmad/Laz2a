function normalizeProductImagePath(image) {
  const path = typeof image === 'string' ? image : image?.relative_path || image?.path || '';
  const trimmed = String(path).trim();
  if (!trimmed) return '';
  return trimmed.startsWith('/stickers/') ? trimmed.slice('/stickers/'.length) : trimmed.replace(/^\/+/, '');
}

export function getProductVariant(product, variantValue) {
  if (!product || !variantValue || !Array.isArray(product.color_variants)) return null;
  return product.color_variants.find((variant) => variant.value === variantValue) || null;
}

export function getProductImages(product, variantValue) {
  if (!product) return [];

  const selectedVariant = getProductVariant(product, variantValue);
  const configuredImages = Array.isArray(selectedVariant?.images)
    ? selectedVariant.images
    : Array.isArray(product.images) ? product.images : [];
  const candidates = configuredImages.length ? configuredImages : [product.relative_path];
  const paths = candidates.map(normalizeProductImagePath).filter(Boolean);

  return [...new Set(paths)];
}

export function getProductCardImage(product, variantValue) {
  if (!product) return '';
  const selectedVariant = getProductVariant(product, variantValue);
  if (selectedVariant?.images?.length) return normalizeProductImagePath(selectedVariant.images[0]);
  return normalizeProductImagePath(product.card_image) || getProductImages(product)[0] || '';
}
