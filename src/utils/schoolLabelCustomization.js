const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function buildSchoolLabelCustomization({
  design,
  text,
  layoutMode = 'all',
  groupLayout,
  lineLayouts = [],
  fields,
  rendering,
}) {
  const exactText = String(text ?? '');
  const individual = layoutMode === 'individual';
  const lines = exactText.split('\n').map((lineText, index) => {
    const source = individual ? (lineLayouts[index] || {}) : (groupLayout || {});
    return {
      index,
      text: lineText,
      sizeScale: clamp(source.sizeScale ?? 100, 50, 200),
      x: clamp(source.x ?? 50, 0, 100),
      y: clamp(source.y ?? 50, 0, 100),
      align: ['start', 'center', 'end'].includes(source.align) ? source.align : 'center',
    };
  });

  const customization = {
    type: 'school_label',
    version: 1,
    designId: design?.id || '',
    designTitleAr: design?.title_ar || '',
    designTitleEn: design?.title_en || '',
    text: exactText,
    layoutMode: individual ? 'individual' : 'all',
    lines,
  };

  if (individual) {
    customization.lineLayouts = lines.map(({ index, sizeScale, x, y, align }) => ({ index, sizeScale, x, y, align }));
  } else {
    const source = groupLayout || {};
    customization.groupLayout = {
      sizeScale: clamp(source.sizeScale ?? 100, 50, 200),
      x: clamp(source.x ?? 50, 0, 100),
      y: clamp(source.y ?? 50, 0, 100),
      align: ['start', 'center', 'end'].includes(source.align) ? source.align : 'center',
    };
  }

  if (fields) customization.fields = { name: String(fields.name ?? ''), className: String(fields.className ?? '') };
  if (rendering) customization.rendering = {
    referenceCanvasWidth: rendering.referenceCanvasWidth,
    fontFamily: rendering.fontFamily,
    fontWeight: rendering.fontWeight,
    color: rendering.color,
    area: { ...rendering.area },
    groupBaseFontSize: rendering.groupBaseFontSize,
    lineBaseFontSizes: [...(rendering.lineBaseFontSizes || [])],
    fit: rendering.fit,
  };
  return customization;
}
