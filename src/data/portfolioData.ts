/**
 * ============================================================================
 * ملف البيانات المركزي للبورتفوليو — أيمن سعيد العواضي | Ayman Saeed Alawadhi
 * ============================================================================
 *
 * هذا هو الملف المركزي الوحيد الذي يتحكم في جميع بطاقات ونصوص وصور وروابط الموقع.
 *
 * 📌 كيفية التعديل أو الإضافة من الكود مباشرة:
 * ----------------------------------------------------------------------------
 * 1. تحديث رابط النشر على Vercel للسيو (SEO):
 *    - عدّل قيمة siteUrl أدناه إلى رابط موقعك النهائي على Vercel
 *      (وكذلك في ملفي public/robots.txt و public/sitemap.xml و index.html).
 *
 * 2. تغيير الصورة الشخصية:
 *    - استبدل الملف الموجود في المسار: public/profile.jpg بصورتك الجديدة
 *      (أو عدّل قيمة profileImage أدناه إلى مسار الصورة الجديد داخل مجلد public).
 *
 * 3. إضافة صورة لمشروع جديد:
 *    - ضع صورة المشروع داخل المجلد: public/projects/
 *      مثلاً: public/projects/my-new-app.jpg
 *    - ثم اكتب المسار في حقل image داخل بطاقة المشروع هكذا: "/projects/my-new-app.jpg"
 *
 * 4. إضافة أو تعديل بطاقة (مشروع / خدمة / مهارة):
 *    - أضف كائناً جديداً داخل المصفوفة المناسبة أدناه (projects أو services أو skills).
 *
 * 5. التعديل من المتصفح ثم النشر على Vercel:
 *    - افتح لوحة "إدارة البطاقات والصور" من الفوتر (رمز المرور الافتراضي: 2026).
 *    - بعد التعديل، اضغط "تصدير البيانات JSON" وانسخ البيانات إلى هنا قبل الرفع على Vercel.
 * ============================================================================
 */

export type IconKey =
  | 'globe'
  | 'smartphone'
  | 'code'
  | 'database'
  | 'shield'
  | 'layers'
  | 'terminal'
  | 'cpu'
  | 'server';

export type ProjectCategory = 'الويب' | 'Flutter' | 'قواعد البيانات' | 'الشبكات';

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface SkillItem {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  technologies: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: IconKey;
  deliverables: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  year: string;
  summary: string;
  description: string;
  image: string;
  technologies: string[];
  highlights: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface DeveloperSnippet {
  name: string;
  role: string;
  mobile: string[];
  languages: string[];
  databases: string[];
  focus: string;
}

export interface ProfileConfig {
  greeting: string;
  fullName: string;
  englishName: string;
  brandTitle: string;
  roleTitles: string[];
  heroBio: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  profileImage: string;
  floatingBadgeText: string;
}

export interface ContactConfig {
  siteUrl: string;
  email: string;
  whatsapp: string; // بصيغة دولية بدون علامة + مثل: 967770000000
  github: string;
  linkedin?: string;
  location: string;
}

export interface PortfolioData {
  adminPasscode: string;
  profile: ProfileConfig;
  stats: StatItem[];
  developerCard: DeveloperSnippet;
  contact: ContactConfig;
  skills: SkillItem[];
  services: ServiceItem[];
  projects: ProjectItem[];
}

export const PORTFOLIO_STORAGE_KEY = 'ayman_alawadhi_portfolio_v3';

export const PROJECT_CATEGORIES: Array<'الكل' | ProjectCategory> = [
  'الكل',
  'الويب',
  'Flutter',
  'قواعد البيانات',
  'الشبكات',
];

export const defaultPortfolioData: PortfolioData = {
  // رمز المرور الافتراضي للوحة إدارة البطاقات والصور
  adminPasscode: '2026',

  profile: {
    greeting: 'مرحباً بك في مساحتي الرقمية، أنا',
    fullName: 'أيمن سعيد العواضي',
    englishName: 'Ayman Saeed Alawadhi',
    brandTitle: 'أيمن العواضي',
    roleTitles: [
      'مطور تطبيقات الويب',
      'مطور تطبيقات Flutter',
      'مهندس برمجيات وشبكات',
    ],
    heroBio:
      'أبني تطبيقات ويب وجوال سريعة الأداء، وأصمم قواعد بيانات محكمة وبنية شبكات آمنة تجمع بين الكود النظيف وتجربة المستخدم الاحترافية.',
    aboutHeading: 'شغف هندسي يحوّل الأفكار إلى أنظمة رقمية متكاملة',
    aboutParagraphs: [
      'أعمل في تطوير البرمجيات وتطبيقات الويب والجوال انطلاقاً من قناعة بأن البرمجة الناجحة تبدأ بفهم المشكلة وتنتهي بحل عملي مستقر وسهل الاستخدام.',
      'أجمع بين بناء واجهات المستخدم الحديثة وقواعد البيانات العلائقية عبر SQL Server و MySQL، إلى جانب خبرتي في لغات C++ و C# وهندسة الشبكات وحمايتها.',
    ],
    // مسار الصورة الشخصية داخل مجلد public
    profileImage: '/profile.jpg',
    floatingBadgeText: 'Software Developer • متاح للعمل الحر',
  },

  stats: [
    { id: 'stat-fields', value: '4+', label: 'مجالات تقنية' },
    { id: 'stat-projects', value: '+12', label: 'مشروع برمجي' },
    { id: 'stat-it', value: 'IT', label: 'تقنية معلومات' },
  ],

  developerCard: {
    name: 'أيمن سعيد العواضي | Ayman Saeed Alawadhi',
    role: 'Software & Web Developer',
    mobile: ['Flutter'],
    languages: ['C++', 'C#'],
    databases: ['SQL Server', 'MySQL'],
    focus: 'Clean Code & Modern UI',
  },

  contact: {
    // ضع هنا رابط النشر النهائي على Vercel بعد الرفع
    siteUrl: 'https://ayman-alawadhi.vercel.app',
    email: 'aymanalawadhi844@gmail.com',
    // استبدل هذا الرقم برقم الواتساب الفعلي بصيغة دولية بدون +
    whatsapp: '967770000000',
    github: 'https://github.com/ayman-alawadhi',
    linkedin: 'https://linkedin.com/in/ayman-alawadhi',
    location: 'اليمن — متاح للعمل عن بُعد',
  },

  skills: [
    {
      id: 'skill-web',
      title: 'تطوير الويب',
      description: 'بناء مواقع وتطبيقات ويب سريعة ومتجاوبة وفق أحدث معايير الأداء.',
      icon: 'globe',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS'],
    },
    {
      id: 'skill-mobile',
      title: 'تطوير الجوال',
      description: 'تطبيقات هاتف متعددة المنصات بأداء سلس لنظامي Android و iOS.',
      icon: 'smartphone',
      technologies: ['Flutter', 'Dart', 'REST APIs', 'State Management'],
    },
    {
      id: 'skill-core',
      title: 'البرمجة الأساسية',
      description: 'تطبيق البرمجة الكائنية وهياكل البيانات لبناء أنظمة عالية الاعتمادية.',
      icon: 'code',
      technologies: ['C++', 'C#', '.NET', 'OOP & Algorithms'],
    },
    {
      id: 'skill-db',
      title: 'قواعد البيانات',
      description: 'تصميم المخططات العلائقية وتحسين الاستعلامات وحفظ سلامة البيانات.',
      icon: 'database',
      technologies: ['SQL Server', 'MySQL', 'T-SQL', 'Stored Procedures'],
    },
    {
      id: 'skill-network',
      title: 'الشبكات وأمن المعلومات',
      description: 'تهيئة الشبكات المحلية والمؤسسية وضبط الجدران النارية وتأمين المنافذ.',
      icon: 'shield',
      technologies: ['Routing & Switching', 'Firewalls', 'VLANs', 'Network Security'],
    },
  ],

  services: [
    {
      id: 'service-web',
      title: 'تصميم وتطوير مواقع الويب',
      description: 'مواقع سريعة ومتجاوبة بتصميم عصري يبرز هويتك ويمنح زوارك تجربة سلسة.',
      icon: 'globe',
      deliverables: [
        'تصميم واجهات عربية RTL متكاملة',
        'سرعة تحميل عالية وتحسين لمحركات البحث',
      ],
    },
    {
      id: 'service-flutter',
      title: 'تطوير تطبيقات الجوال Flutter',
      description: 'تطبيقات تعمل بكفاءة على أندرويد و iOS بكود موحد وأداء مستقر.',
      icon: 'smartphone',
      deliverables: [
        'نسخة موحدة لأنظمة Android و iOS',
        'ربط مباشر مع APIs وقواعد البيانات',
      ],
    },
    {
      id: 'service-sql',
      title: 'تصميم وإدارة قواعد البيانات SQL',
      description: 'بناء وهيكلة قواعد بيانات آمنة ومنظمة تضمن سرعة الوصول وسلامة السجلات.',
      icon: 'database',
      deliverables: [
        'رسم المخططات العلائقية ERD وتطبيع الجداول',
        'تحسين الاستعلامات وخطط النسخ الاحتياطي',
      ],
    },
    {
      id: 'service-network',
      title: 'إعداد وحماية الشبكات',
      description: 'تهيئة الشبكات ورفع مستوى الحماية لضمان استمرارية العمل ومنع الثغرات.',
      icon: 'shield',
      deliverables: [
        'تقسيم الشبكات وإدارة IP و VLANs',
        'ضبط جدران الحماية ومراقبة الاستقرار',
      ],
    },
  ],

  projects: [
    {
      id: 'project-analytics-web',
      title: 'منصة لوحة قيادة وتحليلات الأعمال',
      category: 'الويب',
      year: '2026',
      summary: 'تطبيق ويب إداري باللغة العربية لمتابعة مؤشرات المبيعات والعملاء بتصميم داكن عصري.',
      description:
        'منصة ويب متكاملة مصممة لدعم فرق الإدارة في مراقبة الأداء اليومي والتقارير المالية. تعتمد المنصة على واجهة RTL دقيقة مع جداول بيانات متقدمة وتصفية فورية وتقارير قابلة للتصدير.',
      image: '/projects/web-dashboard.jpg',
      technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS'],
      highlights: [
        'دعم كامل للغة العربية واتجاه RTL مع رسوم بيانية واضحة',
        'تصفية فورية للسجلات وتوافق تام مع جميع الشاشات',
      ],
      liveUrl: 'https://github.com/ayman-alawadhi',
      githubUrl: 'https://github.com/ayman-alawadhi',
    },
    {
      id: 'project-flutter-commerce',
      title: 'تطبيق متجر ومحفظة ذكية عبر Flutter',
      category: 'Flutter',
      year: '2026',
      summary: 'تطبيق جوال متعدد المنصات يجمع بين استعراض المنتجات وإدارة السلة وتتبع المعاملات.',
      description:
        'تطبيق جوال مطور باستخدام Flutter ليعمل بكفاءة على نظامي Android و iOS من قاعدة كود واحدة مع إدارة حالة منظمة ومزامنة موثوقة مع الخادم الخلفي.',
      image: '/projects/flutter-app.jpg',
      technologies: ['Flutter', 'Dart', 'REST API', 'SQLite'],
      highlights: [
        'أداء سلس بمعدل إطارات ثابت على Android و iOS',
        'تخزين محلي ذكي للبيانات عند ضعف الاتصال',
      ],
      liveUrl: 'https://github.com/ayman-alawadhi',
      githubUrl: 'https://github.com/ayman-alawadhi',
    },
    {
      id: 'project-sql-erp',
      title: 'نظام إدارة المخزون والمبيعات SQL Server',
      category: 'قواعد البيانات',
      year: '2025',
      summary: 'قاعدة بيانات علائقية متكاملة مع واجهة C# لإدارة الفواتير والموردين والمستودعات.',
      description:
        'نظام مؤسسي يرتكز على قاعدة بيانات محكمة في SQL Server مربوطة بتطبيق إداري بلغة C#، ويضمن دقة العمليات المتزامنة عبر Transactions وإجراءات مخزنة محسّنة.',
      image: '/projects/sql-system.jpg',
      technologies: ['SQL Server', 'C#', 'T-SQL', 'Stored Procedures'],
      highlights: [
        'هيكلة علائقية خالية من التكرار وفق معايير Normalization',
        'تقارير جرد ومبيعات فورية وصلاحيات دقيقة للمستخدمين',
      ],
      githubUrl: 'https://github.com/ayman-alawadhi',
    },
    {
      id: 'project-network-shield',
      title: 'هيكلة وتأمين شبكة مؤسسية متعددة الفروع',
      category: 'الشبكات',
      year: '2025',
      summary: 'تصميم وتنفيذ شبكة معزولة بتقنية VLANs مع جدار حماية مركزي ومراقبة الاتصال.',
      description:
        'مشروع هندسة شبكات لفصل شبكات الأقسام الإدارية عن شبكات الضيوف والخوادم، مع تطبيق سياسات جدار ناري صارمة وتقليص نقاط الضعف المحتملة.',
      image: '/projects/network-security.jpg',
      technologies: ['VLANs', 'Firewall Policy', 'TCP/IP', 'Network Security'],
      highlights: [
        'عزل حركة البيانات الحساسة بين الأقسام عبر VLANs',
        'حماية المنافذ وتوثيق كامل لمخطط الشبكة',
      ],
      githubUrl: 'https://github.com/ayman-alawadhi',
    },
  ],
};
