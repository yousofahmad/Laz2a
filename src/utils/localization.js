import englishCatalog from '../data/catalog.en.json';

const ENGLISH_CATEGORIES = {
  'الكل': 'All',
  'البرمجة والتقنية': 'Programming & Tech',
  'الأمن السيبراني': 'Cybersecurity',
  'تطوير الويب': 'Web Development',
  'لغات البرمجة': 'Programming Languages',
  'برمجة وتقنية عامة': 'General Programming & Tech',
  'الذكاء الاصطناعي': 'Artificial Intelligence & Machine Learning',
  'أدوات وأنظمة تقنية': 'Tech Tools & Systems',
  'الأخطاء وتصحيح الكود': 'Errors & Debugging',
  'المسابقات وحل المشكلات': 'Coding Challenges & Problem Solving',
  'اختصارات ولوحة المفاتيح': 'Keyboard Shortcuts',
  'المهن والهوية التقنية': 'Tech Careers & Identity',
  'حياة المبرمج والعمل': 'Programmer Life & Work',
  'نكات وميمز برمجية': 'Programming Jokes & Memes',
  'تحفيز وتطوير الذات': 'Motivation & Personal Growth',
  'ميمز وإيفيهات': 'Memes & Comedy',
  'إسلاميات وأدعية': 'Faith & Supplications',
  'أفلام وألعاب': 'Movies & Games',
  'الدراسة والتخرج': 'Study & Graduation',
  'الجيم والرياضة': 'Fitness & Sports',
  'جماليات وفنون': 'Aesthetics & Art',
  'كوليكشنات': 'Collections',
  'فلسطين': 'Palestine',
  'الكتب والقراءة': 'Books & Reading',
};

export function localizedCategory(category, language) {
  if (language === 'ar') return category || '';
  return ENGLISH_CATEGORIES[category] || category || '';
}

export function localizedProductTitle(product, language) {
  if (!product) return '';
  if (language === 'ar') return product.title || product.title_original || '';
  return englishCatalog[String(product.id)]?.title || product.title_original || product.title || '';
}

export function localizedProductDescription(product, language) {
  if (!product) return '';
  if (language === 'ar') return product.description_ar || product.category_name_ar || '';
  return englishCatalog[String(product.id)]?.description || localizedCategory(product.category_name_ar, language);
}
