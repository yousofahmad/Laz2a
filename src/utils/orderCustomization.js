export function buildOrderNotes(customerNotes, cart) {
  const userNotes = String(customerNotes || '').trim();
  const customItems = (Array.isArray(cart) ? cart : []).filter((item) => item && item.customization);
  if (customItems.length === 0) return userNotes;

  const serializedCustomizations = customItems.map((item) => JSON.stringify({
    product_id: item.product?.id ?? null,
    product_title: item.product?.title_ar || item.product?.title || '',
    quantity: item.quantity || 1,
    customization: item.customization,
  }));
  const customizationBlock = [
    'تفاصيل التخصيصات (JSON للحفاظ على النص حرفياً):',
    ...serializedCustomizations,
  ].join('\n');

  return [userNotes, customizationBlock].filter(Boolean).join('\n\n');
}
