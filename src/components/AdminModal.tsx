import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Check,
  Download,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  PROJECT_CATEGORIES,
  type IconKey,
  type PortfolioData,
  type ProjectCategory,
  type ProjectItem,
  type ServiceItem,
  type SkillItem,
} from '../data/portfolioData';
import { ICON_OPTIONS } from './IconMapper';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  onUpdateData: (next: PortfolioData) => void;
  onResetDefaults: () => void;
  onNotify: (msg: string) => void;
}

type AdminTab = 'profile' | 'projects' | 'services' | 'skills';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('تعذر قراءة الملف'));
      }
    };
    reader.onerror = () => reject(new Error('فشل تحميل الصورة'));
    reader.readAsDataURL(file);
  });
}

export function AdminModal({
  isOpen,
  onClose,
  data,
  onUpdateData,
  onResetDefaults,
  onNotify,
}: AdminModalProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPasscodeError('');
      setConfirmReset(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === data.adminPasscode) {
      setUnlocked(true);
      setPasscodeError('');
      setPasscodeInput('');
    } else {
      setPasscodeError('رمز المرور غير صحيح');
    }
  };

  const handleExportJson = async () => {
    const jsonString = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopiedJson(true);
      onNotify('تم نسخ بيانات JSON إلى الحافظة');
      window.setTimeout(() => setCopiedJson(false), 2200);
    } catch {
      onNotify('تم تجهيز ملف JSON للتنزيل');
    }

    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'portfolio-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProfileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUpdateData({
        ...data,
        profile: { ...data.profile, profileImage: dataUrl },
      });
      onNotify('تم تحديث الصورة الشخصية في المعاينة المحلية');
    } catch {
      onNotify('تعذر قراءة ملف الصورة');
    }
  };

  const handleProjectImageUpload = async (
    projectId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      onUpdateData({
        ...data,
        projects: data.projects.map((p) =>
          p.id === projectId ? { ...p, image: dataUrl } : p
        ),
      });
      onNotify('تم رفع صورة المشروع وحفظها محلياً');
    } catch {
      onNotify('تعذر قراءة صورة المشروع');
    }
  };

  // إدارة المشاريع
  const addProject = () => {
    const newProject: ProjectItem = {
      id: `project-${Date.now()}`,
      title: 'مشروع برمجي جديد',
      category: 'الويب',
      year: String(new Date().getFullYear()),
      summary: 'وصف مختصر يوضح فكرة المشروع وأهم نتائجه.',
      description: 'وصف تفصيلي للمشروع والتقنيات والحلول الهندسية المنفذة.',
      image: '/projects/web-dashboard.jpg',
      technologies: ['React', 'TypeScript'],
      highlights: ['أداء سريع وواجهة حديثة', 'كود منظم وقابل للتوسع'],
      liveUrl: '',
      githubUrl: data.contact.github,
    };
    onUpdateData({
      ...data,
      projects: [newProject, ...data.projects],
    });
    onNotify('تمت إضافة بطاقة مشروع جديدة');
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    onUpdateData({
      ...data,
      projects: data.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const deleteProject = (id: string) => {
    onUpdateData({
      ...data,
      projects: data.projects.filter((p) => p.id !== id),
    });
    onNotify('تم حذف المشروع');
  };

  // إدارة الخدمات
  const addService = () => {
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      title: 'خدمة تقنية جديدة',
      description: 'وصف واضح للخدمة وما تقدمه للعميل.',
      icon: 'code',
      deliverables: ['تنفيذ احترافي وفق المتطلبات', 'دعم فني وتوثيق'],
    };
    onUpdateData({
      ...data,
      services: [...data.services, newService],
    });
    onNotify('تمت إضافة خدمة جديدة');
  };

  const updateService = (id: string, patch: Partial<ServiceItem>) => {
    onUpdateData({
      ...data,
      services: data.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    });
  };

  const deleteService = (id: string) => {
    onUpdateData({
      ...data,
      services: data.services.filter((s) => s.id !== id),
    });
    onNotify('تم حذف الخدمة');
  };

  // إدارة المهارات
  const addSkill = () => {
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      title: 'مهارة تقنية جديدة',
      description: 'نبذة مختصرة عن الخبرة في هذه التقنية.',
      icon: 'terminal',
      technologies: ['Technology 1', 'Technology 2'],
    };
    onUpdateData({
      ...data,
      skills: [...data.skills, newSkill],
    });
    onNotify('تمت إضافة مهارة جديدة');
  };

  const updateSkill = (id: string, patch: Partial<SkillItem>) => {
    onUpdateData({
      ...data,
      skills: data.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk)),
    });
  };

  const deleteSkill = (id: string) => {
    onUpdateData({
      ...data,
      skills: data.skills.filter((sk) => sk.id !== id),
    });
    onNotify('تم حذف المهارة');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#121216] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ترويسة لوحة الإدارة */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0A0A0C] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Lock className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <h2 id="admin-modal-title" className="text-base sm:text-lg font-bold text-white">
              لوحة إدارة البطاقات والصور
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق لوحة الإدارة"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121216] text-zinc-300 hover:border-[#D4AF37] hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* شاشة رمز المرور */}
        {!unlocked ? (
          <form
            onSubmit={handleUnlock}
            className="mx-auto my-12 w-full max-w-sm space-y-5 px-6 text-center"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F3E5AB]">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">أدخل رمز مرور الإدارة</h3>
              <p className="text-xs leading-relaxed text-zinc-400">
                الرمز الافتراضي هو <span className="font-mono-code text-[#F3E5AB]">2026</span> ويمكن تغييره من ملف{' '}
                <span dir="ltr" className="font-mono-code text-zinc-300">src/data/portfolioData.ts</span>{' '}
                أو من داخل اللوحة.
              </p>
            </div>

            <div className="space-y-2 text-right">
              <label htmlFor="admin-passcode" className="sr-only">
                رمز المرور
              </label>
              <input
                id="admin-passcode"
                type="password"
                autoFocus
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="أدخل رمز المرور..."
                className="w-full rounded-xl border border-white/15 bg-[#0A0A0C] px-4 py-3 text-center font-mono-code text-sm text-white focus:border-[#D4AF37] focus:outline-none"
              />
              {passcodeError && (
                <p className="text-xs font-medium text-rose-400">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl gold-gradient-bg py-2.5 text-sm font-bold text-[#0A0A0C]"
            >
              فتح لوحة التحكم
            </button>
          </form>
        ) : (
          <>
            {/* شريط التبويبات والإجراءات */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#16161B] px-5 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'projects', label: `المشاريع (${data.projects.length})` },
                    { id: 'services', label: `الخدمات (${data.services.length})` },
                    { id: 'skills', label: `المهارات (${data.skills.length})` },
                    { id: 'profile', label: 'البروفايل والروابط' },
                  ] as Array<{ id: AdminTab; label: string }>
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'gold-gradient-bg text-[#0A0A0C]'
                        : 'border border-white/10 bg-[#0A0A0C] text-zinc-300 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#0A0A0C] px-3 py-1.5 text-xs font-bold text-[#F3E5AB] hover:border-[#D4AF37] hover:bg-[#D4AF37]/10"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>تم النسخ والتنزيل</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>تصدير البيانات JSON</span>
                    </>
                  )}
                </button>

                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0A0A0C] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-rose-400/50 hover:text-rose-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>استعادة الافتراضي</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onResetDefaults();
                      setConfirmReset(false);
                      onNotify('تمت استعادة البيانات الافتراضية');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500"
                  >
                    <span>تأكيد الاستعادة</span>
                  </button>
                )}
              </div>
            </div>

            {/* محتوى التبويب النشط */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* تنبيه الحفظ التلقائي */}
              <div className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-4 py-3 text-xs leading-relaxed text-zinc-200">
                يتم حفظ جميع التعديلات تلقائياً في المتصفح (<span className="font-mono-code">localStorage</span>). قبل النشر على Vercel، استخدم زر <strong>تصدير البيانات JSON</strong> أعلاه وانسخ التغييرات إلى ملف <span dir="ltr" className="font-mono-code text-[#F3E5AB]">src/data/portfolioData.ts</span> لتظهر لجميع الزوار.
              </div>

              {/* تبويب المشاريع */}
              {activeTab === 'projects' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">إدارة بطاقات المشاريع</h3>
                    <button
                      type="button"
                      onClick={addProject}
                      className="inline-flex items-center gap-1.5 rounded-xl gold-gradient-bg px-4 py-2 text-xs font-bold text-[#0A0A0C]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>إضافة مشروع</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.projects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-xl border border-white/10 bg-[#0A0A0C] p-4 sm:p-5 space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3">
                          <span className="text-sm font-bold text-[#F3E5AB]">
                            {project.title || 'مشروع بدون عنوان'}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteProject(project.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>حذف</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="space-y-1.5 sm:col-span-2">
                            <label className="block text-xs text-zinc-400">عنوان المشروع</label>
                            <input
                              type="text"
                              value={project.title}
                              onChange={(e) =>
                                updateProject(project.id, { title: e.target.value })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1.5">
                              <label className="block text-xs text-zinc-400">التصنيف</label>
                              <select
                                value={project.category}
                                onChange={(e) =>
                                  updateProject(project.id, {
                                    category: e.target.value as ProjectCategory,
                                  })
                                }
                                className="w-full rounded-lg border border-white/10 bg-[#121216] px-2.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              >
                                {PROJECT_CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="block text-xs text-zinc-400">السنة</label>
                              <input
                                type="text"
                                value={project.year}
                                onChange={(e) =>
                                  updateProject(project.id, { year: e.target.value })
                                }
                                className="w-full rounded-lg border border-white/10 bg-[#121216] px-2.5 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="block text-xs text-zinc-400">
                              مسار الصورة أو رابطها (مثل /projects/app.jpg)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                dir="ltr"
                                value={project.image.startsWith('data:') ? 'صورة مرفوعة محلياً (Base64)' : project.image}
                                onChange={(e) =>
                                  updateProject(project.id, { image: e.target.value })
                                }
                                className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                              />
                              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#121216] px-3 py-2 text-xs font-semibold text-[#F3E5AB] hover:bg-[#D4AF37]/10 whitespace-nowrap shrink-0">
                                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>رفع صورة</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleProjectImageUpload(project.id, e)}
                                />
                              </label>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs text-zinc-400">
                              التقنيات (افصل بينها بفاصلة ,)
                            </label>
                            <input
                              type="text"
                              dir="ltr"
                              value={project.technologies.join(', ')}
                              onChange={(e) =>
                                updateProject(project.id, {
                                  technologies: e.target.value
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs text-zinc-400">ملخص البطاقة</label>
                          <input
                            type="text"
                            value={project.summary}
                            onChange={(e) =>
                              updateProject(project.id, { summary: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs text-zinc-400">الوصف الكامل في نافذة التفاصيل</label>
                          <textarea
                            rows={2}
                            value={project.description}
                            onChange={(e) =>
                              updateProject(project.id, { description: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="block text-xs text-zinc-400">رابط المعاينة (اختياري)</label>
                            <input
                              type="url"
                              dir="ltr"
                              value={project.liveUrl ?? ''}
                              onChange={(e) =>
                                updateProject(project.id, { liveUrl: e.target.value })
                              }
                              placeholder="https://..."
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs text-zinc-400">رابط GitHub (اختياري)</label>
                            <input
                              type="url"
                              dir="ltr"
                              value={project.githubUrl ?? ''}
                              onChange={(e) =>
                                updateProject(project.id, { githubUrl: e.target.value })
                              }
                              placeholder="https://github.com/..."
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* تبويب الخدمات */}
              {activeTab === 'services' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">إدارة بطاقات الخدمات</h3>
                    <button
                      type="button"
                      onClick={addService}
                      className="inline-flex items-center gap-1.5 rounded-xl gold-gradient-bg px-4 py-2 text-xs font-bold text-[#0A0A0C]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>إضافة خدمة</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.services.map((service) => (
                      <div
                        key={service.id}
                        className="rounded-xl border border-white/10 bg-[#0A0A0C] p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                          <span className="text-sm font-bold text-[#F3E5AB]">
                            {service.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteService(service.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>حذف</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-xs text-zinc-400">عنوان الخدمة</label>
                            <input
                              type="text"
                              value={service.title}
                              onChange={(e) =>
                                updateService(service.id, { title: e.target.value })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs text-zinc-400">الأيقونة</label>
                            <select
                              value={service.icon}
                              onChange={(e) =>
                                updateService(service.id, {
                                  icon: e.target.value as IconKey,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            >
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-zinc-400">وصف الخدمة</label>
                          <textarea
                            rows={2}
                            value={service.description}
                            onChange={(e) =>
                              updateService(service.id, { description: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-zinc-400">
                            المزايا (سطر لكل ميزة)
                          </label>
                          <textarea
                            rows={3}
                            value={service.deliverables.join('\n')}
                            onChange={(e) =>
                              updateService(service.id, {
                                deliverables: e.target.value
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* تبويب المهارات */}
              {activeTab === 'skills' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">إدارة بطاقات المهارات</h3>
                    <button
                      type="button"
                      onClick={addSkill}
                      className="inline-flex items-center gap-1.5 rounded-xl gold-gradient-bg px-4 py-2 text-xs font-bold text-[#0A0A0C]"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      <span>إضافة مهارة</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {data.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="rounded-xl border border-white/10 bg-[#0A0A0C] p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                          <span className="text-sm font-bold text-[#F3E5AB]">
                            {skill.title}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteSkill(skill.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-500/15"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>حذف</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="block text-xs text-zinc-400">عنوان المهارة</label>
                            <input
                              type="text"
                              value={skill.title}
                              onChange={(e) =>
                                updateSkill(skill.id, { title: e.target.value })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-xs text-zinc-400">الأيقونة</label>
                            <select
                              value={skill.icon}
                              onChange={(e) =>
                                updateSkill(skill.id, {
                                  icon: e.target.value as IconKey,
                                })
                              }
                              className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                            >
                              {ICON_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-zinc-400">وصف المهارة</label>
                          <textarea
                            rows={2}
                            value={skill.description}
                            onChange={(e) =>
                              updateSkill(skill.id, { description: e.target.value })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-xs text-zinc-400">
                            الأدوات والتقنيات (افصل بفاصلة ,)
                          </label>
                          <input
                            type="text"
                            dir="ltr"
                            value={skill.technologies.join(', ')}
                            onChange={(e) =>
                              updateSkill(skill.id, {
                                technologies: e.target.value
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* تبويب البروفايل وبيانات التواصل */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#F3E5AB]">
                      الصورة الشخصية والبيانات الأساسية
                    </h3>

                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={data.profile.profileImage}
                        alt={data.profile.fullName}
                        className="h-16 w-16 rounded-full border border-[#D4AF37]/50 object-cover object-top bg-[#121216]"
                      />
                      <div className="flex-1 min-w-[220px] space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          مسار الصورة الشخصية (الافتراضي: /profile.jpg)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            dir="ltr"
                            value={
                              data.profile.profileImage.startsWith('data:')
                                ? 'صورة مرفوعة محلياً (Base64)'
                                : data.profile.profileImage
                            }
                            onChange={(e) =>
                              onUpdateData({
                                ...data,
                                profile: {
                                  ...data.profile,
                                  profileImage: e.target.value,
                                },
                              })
                            }
                            className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                          />
                          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#121216] px-3 py-2 text-xs font-semibold text-[#F3E5AB] hover:bg-[#D4AF37]/10 whitespace-nowrap shrink-0">
                            <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>رفع صورة جديدة</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfileImageUpload}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">الاسم الكامل (بالعربية)</label>
                        <input
                          type="text"
                          value={data.profile.fullName}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              profile: { ...data.profile, fullName: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">الاسم بالإنجليزية (SEO)</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={data.profile.englishName}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              profile: { ...data.profile, englishName: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm font-mono-code text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          نص الشارة العائمة أسفل الصورة
                        </label>
                        <input
                          type="text"
                          value={data.profile.floatingBadgeText}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              profile: {
                                ...data.profile,
                                floatingBadgeText: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          رمز مرور لوحة الإدارة
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={data.adminPasscode}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              adminPasscode: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm font-mono-code text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs text-zinc-400">
                        النبذة المختصرة في الواجهة الرئيسية
                      </label>
                      <textarea
                        rows={2}
                        value={data.profile.heroBio}
                        onChange={(e) =>
                          onUpdateData({
                            ...data,
                            profile: { ...data.profile, heroBio: e.target.value },
                          })
                        }
                        className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-[#0A0A0C] p-5 space-y-4">
                    <h3 className="text-sm font-bold text-[#F3E5AB]">
                      بيانات التواصل والروابط
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs text-zinc-400">
                          رابط الموقع النهائي على Vercel (للفهرسة و Canonical)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={data.contact.siteUrl}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              contact: { ...data.contact, siteUrl: e.target.value },
                            })
                          }
                          placeholder="https://your-site.vercel.app"
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">البريد الإلكتروني</label>
                        <input
                          type="email"
                          dir="ltr"
                          value={data.contact.email}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              contact: { ...data.contact, email: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          رقم الواتساب (صيغة دولية بدون + مثل 967770000000)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={data.contact.whatsapp}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              contact: { ...data.contact, whatsapp: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">رابط GitHub</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={data.contact.github}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              contact: { ...data.contact, github: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">رابط LinkedIn (اختياري)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={data.contact.linkedin ?? ''}
                          onChange={(e) =>
                            onUpdateData({
                              ...data,
                              contact: { ...data.contact, linkedin: e.target.value },
                            })
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
