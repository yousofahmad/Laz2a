const asset = (name) => `/stickers/Custom/School-Labels/${name}.webp`;
const makeDesign = (id, category, titleAr, titleEn, file, mode, style, area, size, extras = {}) => ({
  id,
  category,
  title_ar: titleAr,
  title_en: titleEn,
  image: asset(file),
  mode,
  style,
  area,
  width: size[0],
  height: size[1],
  ...extras,
});

export const SCHOOL_LABEL_CATEGORIES = [
  { id: 'animals', title_ar: 'حيوانات لطيفة', title_en: 'Cute animals' },
  { id: 'bees', title_ar: 'ليبلات النحل', title_en: 'Bee labels' },
  { id: 'stationery', title_ar: 'أدوات المدرسة', title_en: 'School supplies' },
  { id: 'subjects', title_ar: 'ليبلات المواد', title_en: 'Subject labels' },
];

const friendly = "'Baloo Bhaijaan 2', 'Tajawal', sans-serif";
const neat = "'Cairo', 'Tajawal', sans-serif";

export const SCHOOL_LABEL_DESIGNS = [
  makeDesign('animal-bunny', 'animals', 'أرنب بنفسجي', 'Purple bunny', 'animal-bunny', 'free', { fontFamily: friendly, color: '#57376D', weight: 800 }, { left: '23%', top: '22%', width: '71%', height: '56%' }, [640, 189]),
  makeDesign('animal-bear', 'animals', 'دب بني', 'Brown bear', 'animal-bear', 'free', { fontFamily: friendly, color: '#633E2F', weight: 800 }, { left: '23%', top: '22%', width: '71%', height: '56%' }, [640, 189]),
  makeDesign('animal-panda', 'animals', 'باندا', 'Panda', 'animal-panda', 'free', { fontFamily: friendly, color: '#29272C', weight: 800 }, { left: '23%', top: '22%', width: '71%', height: '56%' }, [640, 193]),
  makeDesign('animal-strawberry-bear', 'animals', 'دب الفراولة', 'Strawberry bear', 'animal-strawberry-bear', 'free', { fontFamily: friendly, color: '#7B4432', weight: 800 }, { left: '23%', top: '22%', width: '71%', height: '56%' }, [640, 193]),
  makeDesign('animal-peach', 'animals', 'خوخة لطيفة', 'Cute peach', 'animal-peach', 'free', { fontFamily: friendly, color: '#77482C', weight: 800 }, { left: '23%', top: '22%', width: '71%', height: '56%' }, [640, 193]),

  makeDesign('bee-01', 'bees', 'نحلة وزهرة ١', 'Bee & flower 1', 'bee-01', 'free', { fontFamily: neat, color: '#35513C', weight: 700 }, { left: '16%', top: '30%', width: '68%', height: '42%' }, [685, 229]),
  makeDesign('bee-02', 'bees', 'نحلة وزهرة ٢', 'Bee & flower 2', 'bee-02', 'free', { fontFamily: neat, color: '#35513C', weight: 700 }, { left: '16%', top: '30%', width: '68%', height: '42%' }, [685, 229]),
  makeDesign('bee-03', 'bees', 'نحلة وزهرة ٣', 'Bee & flower 3', 'bee-03', 'free', { fontFamily: neat, color: '#35513C', weight: 700 }, { left: '16%', top: '30%', width: '68%', height: '42%' }, [685, 230]),
  makeDesign('bee-04', 'bees', 'نحلة وزهرة ٤', 'Bee & flower 4', 'bee-04', 'free', { fontFamily: neat, color: '#35513C', weight: 700 }, { left: '16%', top: '30%', width: '68%', height: '42%' }, [685, 229]),

  makeDesign('school-supplies-01', 'stationery', 'ألوان وفرشاة ١', 'Crayons & brushes 1', 'school-supplies-01', 'free', { fontFamily: friendly, color: '#93496F', weight: 800 }, { left: '17%', top: '21%', width: '66%', height: '58%' }, [357, 247]),
  makeDesign('school-supplies-02', 'stationery', 'ألوان وفرشاة ٢', 'Crayons & brushes 2', 'school-supplies-02', 'free', { fontFamily: friendly, color: '#386786', weight: 800 }, { left: '17%', top: '21%', width: '66%', height: '58%' }, [357, 247]),
  makeDesign('school-supplies-03', 'stationery', 'قلم ودفتر ١', 'Pencil & notebook 1', 'school-supplies-03', 'free', { fontFamily: friendly, color: '#35726D', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 250]),
  makeDesign('school-supplies-04', 'stationery', 'ألوان الرسم', 'Paint palette', 'school-supplies-04', 'free', { fontFamily: friendly, color: '#80512D', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 250]),
  makeDesign('school-supplies-05', 'stationery', 'قلم رصاص ١', 'Pencils 1', 'school-supplies-05', 'free', { fontFamily: friendly, color: '#67508A', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 250]),
  makeDesign('school-supplies-06', 'stationery', 'دفتر وأقلام', 'Notebook & pencils', 'school-supplies-06', 'free', { fontFamily: friendly, color: '#8B4777', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 250]),
  makeDesign('school-supplies-07', 'stationery', 'كتاب وأقلام تلوين', 'Book & colored pencils', 'school-supplies-07', 'free', { fontFamily: friendly, color: '#47704C', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 218]),
  makeDesign('school-supplies-08', 'stationery', 'مسطرة وفرشاة', 'Ruler & brush', 'school-supplies-08', 'free', { fontFamily: friendly, color: '#456A87', weight: 800 }, { left: '16%', top: '20%', width: '68%', height: '60%' }, [357, 218]),

  makeDesign('subject-english', 'subjects', 'اللغة الإنجليزية', 'English', 'subject-english', 'student', { fontFamily: neat, color: '#483846', weight: 700 }, { left: '38%', top: '61%', width: '23%', height: '15%' }, [259, 299], { fields: { name: 'نور أحمد', className: 'Class 2' } }),
  makeDesign('subject-arabic', 'subjects', 'اللغة العربية', 'Arabic', 'subject-arabic', 'student', { fontFamily: neat, color: '#315141', weight: 700 }, { left: '24%', top: '60%', width: '35%', height: '15%' }, [259, 315], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-history', 'subjects', 'التاريخ', 'History', 'subject-history', 'student', { fontFamily: neat, color: '#62492F', weight: 700 }, { left: '22%', top: '61%', width: '40%', height: '15%' }, [261, 299], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-islamic', 'subjects', 'التربية الإسلامية', 'Islamic education', 'subject-islamic', 'student', { fontFamily: neat, color: '#594773', weight: 700 }, { left: '27%', top: '65%', width: '32%', height: '15%' }, [261, 315], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-art', 'subjects', 'دفتر الرسم', 'Art', 'subject-art', 'student', { fontFamily: neat, color: '#77572F', weight: 700 }, { left: '37%', top: '61%', width: '27%', height: '15%' }, [260, 299], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-math', 'subjects', 'الرياضيات', 'Mathematics', 'subject-math', 'student', { fontFamily: neat, color: '#3D5B70', weight: 700 }, { left: '28%', top: '69%', width: '32%', height: '13%' }, [260, 315], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-geography', 'subjects', 'الجغرافيا', 'Geography', 'subject-geography', 'student', { fontFamily: neat, color: '#365C52', weight: 700 }, { left: '26%', top: '62%', width: '38%', height: '15%' }, [261, 299], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
  makeDesign('subject-science', 'subjects', 'العلوم', 'Science', 'subject-science', 'student', { fontFamily: neat, color: '#785238', weight: 700 }, { left: '28%', top: '67%', width: '33%', height: '15%' }, [261, 315], { fields: { name: 'نور أحمد', className: 'الصف الثاني' } }),
];
