import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaEye, FaInfoCircle } from 'react-icons/fa';
import { useLanguage, localizedCopy } from '../LanguageContext';
import { SCHOOL_LABEL_CATEGORIES, SCHOOL_LABEL_DESIGNS } from '../data/schoolLabelDesigns';
import { buildSchoolLabelCustomization } from '../utils/schoolLabelCustomization';
import './SchoolLabelsPreviewPage.css';

const SAMPLE_TEXT = 'نور أحمد\nClass 2';
const DRAFT_KEY = 'laz2a_school_label_preview_draft_v1';
const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const areaNumber = (area, key, fallback) => parseFloat(area?.[key]) || fallback;

function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}');
    return draft && typeof draft === 'object' && draft.version === 1 ? draft : {};
  } catch (error) {
    return {};
  }
}

function previewFontSize(value, mode) {
  return mode === 'student' ? 17 : 31;
}

function defaultGroupLayout(design) {
  const left = areaNumber(design.area, 'left', 20);
  const top = areaNumber(design.area, 'top', 20);
  const width = areaNumber(design.area, 'width', 60);
  const height = areaNumber(design.area, 'height', 60);
  return { sizeScale: 100, x: left + width / 2, y: top + height / 2, align: 'center' };
}

function defaultLineLayout(design, index, count) {
  const left = areaNumber(design.area, 'left', 20);
  const top = areaNumber(design.area, 'top', 20);
  const width = areaNumber(design.area, 'width', 60);
  const height = areaNumber(design.area, 'height', 60);
  const rowHeight = height / Math.max(1, count);
  return {
    sizeScale: 100,
    x: left + width / 2,
    y: top + rowHeight * (index + 0.5),
    align: 'center',
  };
}

function positionedBox(design, settings, boxHeight) {
  const width = areaNumber(design.area, 'width', 60);
  const height = Math.min(100, Math.max(6, boxHeight));
  const x = clamp(settings.x, width / 2, 100 - width / 2);
  const y = clamp(settings.y, height / 2, 100 - height / 2);
  return {
    position: 'absolute',
    left: `${x}%`,
    top: `${y}%`,
    width: `${width}%`,
    height: `${height}%`,
    transform: 'translate(-50%, -50%)',
  };
}

function PreviewLines({ value, style, className = '', onOverflowChange, overflowKey }) {
  const ref = useRef(null);
  const lines = String(value || '').split('\n');

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    let active = true;
    const measureOverflow = () => {
      if (!active || !node.clientWidth || !node.clientHeight) return;
      const children = Array.from(node.children);
      const height = children.reduce((sum, child) => sum + child.scrollHeight, 0);
      onOverflowChange(overflowKey, height > node.clientHeight || children.some((child) => child.scrollWidth > child.clientWidth));
    };
    measureOverflow();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measureOverflow);
    if (observer && node.parentElement) observer.observe(node.parentElement);
    if (document.fonts?.ready) document.fonts.ready.then(measureOverflow);
    return () => { active = false; if (observer) observer.disconnect(); };
  }, [value, style?.fontSize, style?.fontFamily, style?.fontWeight, className, onOverflowChange, overflowKey]);

  return (
    <div ref={ref} className={`school-label-preview-lines ${className}`} style={style}>
      {lines.map((line, index) => (
        <div key={index} dir="auto" className="school-label-preview-line" style={{ unicodeBidi: 'plaintext', textAlign: style?.textAlign || 'center' }}>
          {line || '\u00a0'}
        </div>
      ))}
    </div>
  );
}

function LayoutControls({ language, title, settings, onChange, width, height }) {
  const t = (english, arabic) => localizedCopy(language, english, arabic);
  const xMin = Math.ceil(width / 2);
  const xMax = Math.floor(100 - width / 2);
  const yMin = Math.ceil(height / 2);
  const yMax = Math.floor(100 - height / 2);
  const alignments = [
    { id: 'start', en: 'Start', ar: 'بداية' },
    { id: 'center', en: 'Center', ar: 'وسط' },
    { id: 'end', en: 'End', ar: 'نهاية' },
  ];

  return (
    <fieldset className="school-label-layout-controls">
      <legend>{title}</legend>
      <label className="school-label-layout-range">
        <span><span>{t('Font size', 'حجم الخط')}</span><b>{Math.round(settings.sizeScale)}%</b></span>
        <input className="school-label-range-input" type="range" min="50" max="200" step="5" value={settings.sizeScale} onChange={(event) => onChange('sizeScale', Number(event.target.value))} aria-label={t('Font size', 'حجم الخط')} />
      </label>
      <label className="school-label-layout-range">
        <span><span>{t('Horizontal position', 'المكان الأفقي')}</span><b>{Math.round(settings.x)}%</b></span>
        <input className="school-label-range-input" type="range" min={xMin} max={xMax} step="1" value={clamp(settings.x, xMin, xMax)} onChange={(event) => onChange('x', Number(event.target.value))} aria-label={t('Horizontal position', 'المكان الأفقي')} />
      </label>
      <label className="school-label-layout-range">
        <span><span>{t('Vertical position', 'المكان الرأسي')}</span><b>{Math.round(settings.y)}%</b></span>
        <input className="school-label-range-input" type="range" min={yMin} max={yMax} step="1" value={clamp(settings.y, yMin, yMax)} onChange={(event) => onChange('y', Number(event.target.value))} aria-label={t('Vertical position', 'المكان الرأسي')} />
      </label>
      <div className="school-label-align-control">
        <span>{t('Text alignment', 'محاذاة الكتابة')}</span>
        <div role="group" aria-label={t('Text alignment', 'محاذاة الكتابة')} className="school-label-align-buttons">
          {alignments.map((alignment) => (
            <button key={alignment.id} type="button" className={settings.align === alignment.id ? 'is-active' : ''} aria-pressed={settings.align === alignment.id} onClick={() => onChange('align', alignment.id)}>
              {t(alignment.en, alignment.ar)}
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}

function SchoolLabelsPreviewPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';
  const [draft] = useState(readDraft);
  const [selectedId, setSelectedId] = useState(() => SCHOOL_LABEL_DESIGNS.some((design) => design.id === draft.selectedId) ? draft.selectedId : SCHOOL_LABEL_DESIGNS[0].id);
  const [activeCategory, setActiveCategory] = useState(() => SCHOOL_LABEL_DESIGNS.find((design) => design.id === draft.selectedId)?.category || SCHOOL_LABEL_CATEGORIES[0].id);
  const [freeText, setFreeText] = useState(() => typeof draft.freeText === 'string' ? draft.freeText : SAMPLE_TEXT);
  const [studentName, setStudentName] = useState(() => typeof draft.studentName === 'string' ? draft.studentName : 'نور أحمد');
  const [studentClass, setStudentClass] = useState(() => typeof draft.studentClass === 'string' ? draft.studentClass : 'الصف الثاني');
  const [isExample, setIsExample] = useState(() => typeof draft.isExample === 'boolean' ? draft.isExample : true);
  const [layoutMode, setLayoutMode] = useState(() => draft.layoutMode === 'individual' ? 'individual' : 'all');
  const [groupLayouts, setGroupLayouts] = useState(() => draft.groupLayouts && typeof draft.groupLayouts === 'object' ? draft.groupLayouts : {});
  const [lineLayouts, setLineLayouts] = useState(() => draft.lineLayouts && typeof draft.lineLayouts === 'object' ? draft.lineLayouts : {});
  const [overflowByKey, setOverflowByKey] = useState({});
  const [lineResetNotice, setLineResetNotice] = useState(false);
  const previewCanvasRef = useRef(null);
  const [canvasWidth, setCanvasWidth] = useState(576);

  const onOverflowChange = useCallback((key, overflow) => {
    setOverflowByKey((current) => current[key] === overflow ? current : { ...current, [key]: overflow });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ version: 1, selectedId, freeText, studentName, studentClass, isExample, layoutMode, groupLayouts, lineLayouts }));
    } catch (error) {
      // Storage can be unavailable in private browsing; editing still works for this session.
    }
  }, [selectedId, freeText, studentName, studentClass, isExample, layoutMode, groupLayouts, lineLayouts]);

  useLayoutEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return undefined;
    const updateWidth = () => setCanvasWidth(canvas.clientWidth || 576);
    updateWidth();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateWidth);
    if (observer) observer.observe(canvas);
    else window.addEventListener('resize', updateWidth);
    return () => { if (observer) observer.disconnect(); else window.removeEventListener('resize', updateWidth); };
  }, []);

  const designsInCategory = useMemo(
    () => SCHOOL_LABEL_DESIGNS.filter((design) => design.category === activeCategory),
    [activeCategory],
  );
  const selectedDesign = SCHOOL_LABEL_DESIGNS.find((design) => design.id === selectedId) || SCHOOL_LABEL_DESIGNS[0];
  const selectedCategory = SCHOOL_LABEL_CATEGORIES.find((category) => category.id === activeCategory);
  const textForPreview = selectedDesign.mode === 'student' ? `${studentName}\n${studentClass}` : freeText;
  const textLines = selectedDesign.mode === 'student'
    ? [
      { key: 'student-name', title: localizedCopy(language, 'Student name', 'اسم الطالب'), value: studentName },
      { key: 'student-class', title: localizedCopy(language, 'Class / grade', 'الفصل / الصف'), value: studentClass },
    ]
    : String(freeText || '').split('\n').map((value, index) => ({
      key: `line-${index}`,
      title: localizedCopy(language, `Line ${index + 1}`, `السطر ${index + 1}`),
      value,
    }));
  const areaWidth = areaNumber(selectedDesign.area, 'width', 60);
  const areaHeight = areaNumber(selectedDesign.area, 'height', 60);
  const groupLayout = groupLayouts[selectedId] || defaultGroupLayout(selectedDesign);
  const currentLineLayouts = textLines.map((line, index) => (
    lineLayouts[`${selectedId}:${line.key}`] || defaultLineLayout(selectedDesign, index, textLines.length)
  ));
  const customizationPayload = buildSchoolLabelCustomization({
    design: selectedDesign,
    text: textForPreview,
    layoutMode,
    groupLayout,
    lineLayouts: currentLineLayouts,
    rendering: {
      referenceCanvasWidth: 576,
      fontFamily: selectedDesign.style.fontFamily,
      fontWeight: selectedDesign.style.weight,
      color: selectedDesign.style.color,
      area: selectedDesign.area,
      groupBaseFontSize: previewFontSize(textForPreview, selectedDesign.mode),
      lineBaseFontSizes: textLines.map((line) => previewFontSize(line.value, selectedDesign.mode)),
      fit: 'none',
    },
    fields: selectedDesign.mode === 'student' ? { name: studentName, className: studentClass } : undefined,
  });

  function chooseCategory(categoryId) {
    const firstDesign = SCHOOL_LABEL_DESIGNS.find((design) => design.category === categoryId);
    setActiveCategory(categoryId);
    if (firstDesign) chooseDesign(firstDesign);
  }

  function chooseDesign(design) {
    setSelectedId(design.id);
  }

  function updateText(setter, value) {
    if (setter === setFreeText && value.split('\n').length !== freeText.split('\n').length) {
      const hadAdjustedLines = Object.keys(lineLayouts).some((key) => key.includes(':line-'));
      if (hadAdjustedLines) {
        setLineLayouts((current) => Object.fromEntries(Object.entries(current).filter(([key]) => !key.includes(':line-'))));
        setLineResetNotice(true);
      }
    }
    setter(value);
    setIsExample(false);
  }

  function updateGroupLayout(field, value) {
    setGroupLayouts((current) => ({
      ...current,
      [selectedId]: { ...(current[selectedId] || defaultGroupLayout(selectedDesign)), [field]: value },
    }));
  }

  function updateLineLayout(line, index, field, value) {
    const key = `${selectedId}:${line.key}`;
    setLineLayouts((current) => ({
      ...current,
      [key]: { ...(current[key] || defaultLineLayout(selectedDesign, index, textLines.length)), [field]: value },
    }));
  }

  const typography = {
    color: selectedDesign.style.color,
    fontFamily: selectedDesign.style.fontFamily,
    fontWeight: selectedDesign.style.weight,
  };
  const groupPreviewStyle = {
    ...positionedBox(selectedDesign, groupLayout, areaHeight),
    ...typography,
    fontSize: `${previewFontSize(textForPreview, selectedDesign.mode) * groupLayout.sizeScale / 100 * canvasWidth / 576}px`,
    textAlign: groupLayout.align,
  };

  return (
    <main className="school-labels-preview-page" dir={isArabic ? 'rtl' : 'ltr'}>
      <Container fluid="xl">
        <Link to="/" className="school-labels-back-link">
          <FaArrowRight aria-hidden="true" />
          {localizedCopy(language, 'Back to store', 'ارجع للمتجر')}
        </Link>
        <header className="school-labels-hero">
          <span className="school-labels-eyebrow">{localizedCopy(language, 'PRODUCT PREVIEW', 'معاينة منتج جديد')}</span>
          <h1>{localizedCopy(language, 'School name labels', 'ليبلات مدرسية')}</h1>
          <p>{localizedCopy(language, 'Choose a design, then type in Arabic, English, or both. The preview updates as you type.', 'اختار الشكل واكتب بالعربي أو الإنجليزي أو الاتنين؛ المعاينة بتتحدث مع كل حرف.')}</p>
        </header>

        <section className="school-labels-category-tabs" aria-label={localizedCopy(language, 'Label categories', 'أقسام الليبلات')}>
          {SCHOOL_LABEL_CATEGORIES.map((category) => (
            <button
              type="button"
              key={category.id}
              className={`school-labels-category-tab${activeCategory === category.id ? ' is-active' : ''}`}
              aria-pressed={activeCategory === category.id}
              onClick={() => chooseCategory(category.id)}
            >
              {localizedCopy(language, category.title_en, category.title_ar)}
              <span>{SCHOOL_LABEL_DESIGNS.filter((design) => design.category === category.id).length}</span>
            </button>
          ))}
        </section>

        <div className="school-labels-editor-grid">
          <section className="school-labels-designs-panel">
            <div className="school-labels-section-heading">
              <div>
                <h2>{localizedCopy(language, 'Choose a label', 'اختار شكل الليبل')}</h2>
                <p>{localizedCopy(language, selectedCategory?.title_en || '', selectedCategory?.title_ar || '')}</p>
              </div>
              <span>{localizedCopy(language, `${designsInCategory.length} designs`, `${designsInCategory.length} أشكال`)}</span>
            </div>
            <div className="school-labels-design-grid">
              {designsInCategory.map((design) => (
                <button
                  type="button"
                  key={design.id}
                  className={`school-label-design-card${selectedId === design.id ? ' is-selected' : ''}`}
                  aria-pressed={selectedId === design.id}
                  onClick={() => chooseDesign(design)}
                >
                  <span className="school-label-design-image-wrap">
                    <img src={design.image} alt={localizedCopy(language, design.title_en, design.title_ar)} loading="lazy" />
                  </span>
                  <span className="school-label-design-name">{localizedCopy(language, design.title_en, design.title_ar)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="school-labels-live-panel">
            <div className="school-labels-section-heading">
              <div>
                <h2><FaEye aria-hidden="true" /> {localizedCopy(language, 'Live preview', 'معاينة مباشرة')}</h2>
                <p>{localizedCopy(language, 'The text, font and color change with your selection.', 'الكتابة والخط واللون بيتغيروا حسب الشكل.')}</p>
              </div>
            </div>
            <div ref={previewCanvasRef} className={`school-label-preview-canvas school-label-preview-canvas--${selectedDesign.category}`} style={{ aspectRatio: `${selectedDesign.width} / ${selectedDesign.height}`, '--label-aspect-ratio': selectedDesign.width / selectedDesign.height }}>
              <img src={selectedDesign.image} alt={localizedCopy(language, selectedDesign.title_en, selectedDesign.title_ar)} />
              {layoutMode === 'all' ? (
                <PreviewLines value={textForPreview} overflowKey="group" onOverflowChange={onOverflowChange} style={{ ...groupPreviewStyle, justifyContent: selectedDesign.mode === 'student' ? 'space-evenly' : 'center', flexDirection: 'column', alignItems: groupLayout.align === 'start' ? 'flex-start' : (groupLayout.align === 'end' ? 'flex-end' : 'center') }} />
              ) : textLines.map((line, index) => {
                const settings = currentLineLayouts[index];
                const lineHeight = areaHeight / Math.max(1, textLines.length);
                const style = {
                  ...positionedBox(selectedDesign, settings, lineHeight),
                  ...typography,
                  fontSize: `${previewFontSize(line.value, selectedDesign.mode) * settings.sizeScale / 100 * canvasWidth / 576}px`,
                  textAlign: settings.align,
                };
                return <PreviewLines key={line.key} value={line.value} style={style} overflowKey={line.key} onOverflowChange={onOverflowChange} />;
              })}
            </div>
            {(layoutMode === 'all' ? overflowByKey.group : textLines.some((line) => overflowByKey[line.key])) && (
              <div className="school-label-layout-warning" role="status">{localizedCopy(language, 'Some text may be clipped. Reduce the font size or shorten the text.', 'في جزء من الكتابة ممكن ما يظهرش؛ صغّر الخط أو قلّل الكلام.')}</div>
            )}
            <div className="school-label-preview-meta">
              <span>{localizedCopy(language, selectedDesign.style.fontFamily.includes('Baloo') ? 'Rounded display font' : 'Clear school-style font', selectedDesign.style.fontFamily.includes('Baloo') ? 'خط دائري مرح' : 'خط مدرسي واضح')}</span>
              <span className="school-label-ink-dot" style={{ backgroundColor: selectedDesign.style.color }} />
              <span>{localizedCopy(language, 'Ink color', 'لون الكتابة')}</span>
            </div>

            {selectedDesign.mode === 'student' ? (
              <div className="school-label-inputs-grid">
                <label className="school-label-input-field">
                  <span>{localizedCopy(language, 'Student name', 'اسم الطالب')}</span>
                  <input value={studentName} maxLength={30} onChange={(event) => updateText(setStudentName, event.target.value)} placeholder={localizedCopy(language, 'Type a name', 'اكتب الاسم')} dir="auto" />
                </label>
                <label className="school-label-input-field">
                  <span>{localizedCopy(language, 'Class / grade', 'الفصل / الصف')}</span>
                  <input value={studentClass} maxLength={30} onChange={(event) => updateText(setStudentClass, event.target.value)} placeholder={localizedCopy(language, 'Type a class', 'اكتب الفصل')} dir="auto" />
                </label>
              </div>
            ) : (
              <label className="school-label-input-field school-label-input-field--textarea">
                <span>{localizedCopy(language, 'Text to print', 'النص اللي هيتطبع')}</span>
                <textarea value={freeText} rows={3} maxLength={90} onChange={(event) => updateText(setFreeText, event.target.value)} placeholder={localizedCopy(language, 'Write a few lines…', 'اكتب كذا سطر…')} dir="auto" />
                <small>{localizedCopy(language, `${freeText.length}/90 characters`, `${freeText.length} من ٩٠ حرف`)}</small>
              </label>
            )}

            <section className="school-label-layout-editor" aria-label={localizedCopy(language, 'Font size and position', 'حجم الخط ومكانه')}>
              <div className="school-label-layout-heading">
                <div>
                  <h3>{localizedCopy(language, 'Text size & position', 'حجم الكتابة ومكانها')}</h3>
                  <p>{localizedCopy(language, 'Adjust all lines together or set each line separately.', 'ظبط كل السطور سوا أو خصص حجم ومكان كل سطر.')}</p>
                  <p>{localizedCopy(language, 'Adding or removing a line resets individual line adjustments for free-text designs.', 'لو ضفت أو مسحت سطر، ضبط السطور الفردي للأشكال ذات النص الحر بيرجع للوضع الأصلي.')}</p>
                </div>
              </div>
              {lineResetNotice && <div className="school-label-layout-warning" role="status">{localizedCopy(language, 'Line adjustments were reset because the number of lines changed.', 'رجّعنا ضبط السطور للوضع الأصلي عشان عدد السطور اتغيّر.')}</div>}
              <div className="school-label-layout-mode" role="group" aria-label={localizedCopy(language, 'Choose which lines to adjust', 'اختار السطور اللي هتتظبط')}>
                <button type="button" className={layoutMode === 'all' ? 'is-active' : ''} aria-pressed={layoutMode === 'all'} onClick={() => setLayoutMode('all')}>
                  {localizedCopy(language, 'All lines together', 'كل السطور سوا')}
                </button>
                <button type="button" className={layoutMode === 'individual' ? 'is-active' : ''} aria-pressed={layoutMode === 'individual'} onClick={() => setLayoutMode('individual')}>
                  {localizedCopy(language, 'Each line separately', 'كل سطر لوحده')}
                </button>
              </div>
              {layoutMode === 'all' ? (
                <LayoutControls
                  language={language}
                  title={localizedCopy(language, 'All lines', 'كل السطور')}
                  settings={groupLayout}
                  onChange={updateGroupLayout}
                  width={areaWidth}
                  height={areaHeight}
                />
              ) : (
                <div className="school-label-line-controls">
                  {textLines.map((line, index) => (
                    <LayoutControls
                      key={line.key}
                      language={language}
                      title={`${line.title}: ${line.value || localizedCopy(language, '(empty)', '(فارغ)')}`}
                      settings={currentLineLayouts[index]}
                      onChange={(field, value) => updateLineLayout(line, index, field, value)}
                      width={areaWidth}
                      height={areaHeight / Math.max(1, textLines.length)}
                    />
                  ))}
                </div>
              )}
            </section>

            <div className="school-labels-note">
              <FaInfoCircle aria-hidden="true" />
              <span>{isExample
                ? localizedCopy(language, 'Example text is shown above. Edit it to see the live preview.', 'المكتوب مثال للتوضيح؛ غيّره عشان تشوف معاينة كلامك.')
                : localizedCopy(language, 'Arabic, English and mixed lines are supported.', 'يدعم العربي والإنجليزي والسطور المختلطة.')}</span>
            </div>
          </section>
        </div>

        <section className="school-labels-draft-notice" data-customization-type={customizationPayload.type} data-customization-version={customizationPayload.version} data-layout-lines={customizationPayload.lines.length}>
          <div className="school-labels-draft-copy">
            <strong>{localizedCopy(language, 'Draft preview — not yet for sale', 'دي معاينة مسودة — مش متاحة للشراء لسه')}</strong>
            <span>{localizedCopy(language, 'Price and pack contents still need confirmation before enabling checkout.', 'لسه محتاجين نحدد السعر ومحتويات الباك قبل ما نفعّل الطلب.')}</span>
          </div>
          <Button type="button" className="school-labels-disabled-cta" disabled>
            {localizedCopy(language, 'Add to cart after pricing is set', 'إضافة للسلة بعد تحديد السعر')}
          </Button>
        </section>
      </Container>
    </main>
  );
}

export default SchoolLabelsPreviewPage;
