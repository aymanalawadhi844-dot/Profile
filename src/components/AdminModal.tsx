import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  browserPopupRedirectResolver,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  Check,
  Cloud,
  Download,
  Loader2,
  Lock,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  PROJECT_CATEGORIES,
  type IconKey,
  type PortfolioData,
  type ProjectCategory,
  type ProjectItem,
  type ServiceItem,
  type SkillItem,
} from '../data/portfolioData';
import { auth, googleProvider } from '../firebase';
import {
  ADMIN_EMAIL,
  compressImageToDataUrl,
  isAuthorizedAdmin,
  saveAllPortfolioToFirestore,
  seedOrResetFirestoreDefaults,
  type FirestoreSyncState,
} from '../services/portfolioFirestore';
import { ICON_OPTIONS } from './IconMapper';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PortfolioData;
  authUser: User | null;
  authReady: boolean;
  syncState: FirestoreSyncState;
  onNotify: (msg: string) => void;
}

type AdminTab = 'projects' | 'services' | 'skills' | 'profile';

export function AdminModal({
  isOpen,
  onClose,
  data,
  authUser,
  authReady,
  syncState,
  onNotify,
}: AdminModalProps) {
  const [draft, setDraft] = useState<PortfolioData>(data);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('projects');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const gsiContainerRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = isAuthorizedAdmin(authUser);
  const isFullySeeded =
    syncState.hasRemoteSettings &&
    syncState.hasRemoteProjects &&
    syncState.hasRemoteServices &&
    syncState.hasRemoteSkills;

  // مزامنة المسودة عند فتح اللوحة أو وصول تحديثات جديدة بدون مسح تعديلات المستخدم غير المحفوظة
  useEffect(() => {
    if (isOpen && !hasUnsavedChanges) {
      setDraft(data);
    }
  }, [isOpen, data, hasUnsavedChanges]);

  useEffect(() => {
    if (!isOpen) {
      setConfirmReset(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  // تحميل زر Google Identity Services المباشر كمسار إضافي آمن داخل الإطارات المضمّنة
  useEffect(() => {
    if (!isOpen || !authReady || authUser) return;
    const clientId = firebaseConfig.oAuthClientId;
    if (!clientId) return;

    let cancelled = false;

    const initGsi = () => {
      const g = (
        window as unknown as {
          google?: {
            accounts?: {
              id?: {
                initialize: (cfg: {
                  client_id: string;
                  callback: (res: { credential?: string }) => void;
                }) => void;
                renderButton: (
                  el: HTMLElement,
                  opts: Record<string, unknown>
                ) => void;
              };
            };
          };
        }
      ).google;

      if (cancelled || !g?.accounts?.id || !gsiContainerRef.current) return;

      g.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential?: string }) => {
          if (!response.credential) return;
          setIsAuthLoading(true);
          setErrorMsg(null);
          try {
            const cred = GoogleAuthProvider.credential(response.credential);
            const result = await signInWithCredential(auth, cred);
            if (isAuthorizedAdmin(result.user)) {
              onNotify('تم تسجيل الدخول وربط لوحة التحكم بـ Firebase');
            } else {
              setErrorMsg(`الحساب (${result.user.email}) غير مخوّل لإدارة الموقع.`);
            }
          } catch (err) {
            setErrorMsg(
              err instanceof Error ? err.message : 'تعذر التحقق من بيانات Google'
            );
          } finally {
            setIsAuthLoading(false);
          }
        },
      });

      gsiContainerRef.current.innerHTML = '';
      g.accounts.id.renderButton(gsiContainerRef.current, {
        theme: 'filled_black',
        size: 'large',
        shape: 'pill',
        text: 'signin_with',
        locale: 'ar',
        width: 320,
      });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]'
    );
    if (existingScript) {
      initGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
  }, [isOpen, authReady, authUser, onNotify]);

  if (!isOpen) return null;

  const updateDraft = (updater: (prev: PortfolioData) => PortfolioData) => {
    setDraft((prev) => updater(prev));
    setHasUnsavedChanges(true);
    setErrorMsg(null);
  };

  const handleGoogleLogin = async () => {
    setIsAuthLoading(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider,
        browserPopupRedirectResolver
      );
      if (isAuthorizedAdmin(result.user)) {
        onNotify('تم تسجيل الدخول وربط لوحة التحكم بـ Firebase');
      } else {
        setErrorMsg(`الحساب (${result.user.email}) غير مخوّل لإدارة الموقع.`);
      }
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : '';
      const rawMsg =
        error instanceof Error ? error.message : 'تعذر تسجيل الدخول عبر Google';

      if (code === 'auth/popup-closed-by-user' || rawMsg.includes('popup-closed-by-user')) {
        return;
      }

      if (code === 'auth/internal-error' || rawMsg.includes('auth/internal-error')) {
        setErrorMsg(
          'تعذر إتمام النافذة المنبثقة بسبب قيود المتصفح أو المعاينة المضمنة (auth/internal-error). جرّب زر تسجيل الدخول المباشر عبر Google أعلاه، أو تأكد من السماح بالنوافذ المنبثقة وعدم تفعيل مانع الإعلانات.'
        );
      } else if (code === 'auth/popup-blocked' || rawMsg.includes('popup-blocked')) {
        setErrorMsg(
          'قام المتصفح بحظر النافذة المنبثقة لتسجيل الدخول. اسمح بالنوافذ المنبثقة لهذا الموقع أو افتحه في تبويب مستقل.'
        );
      } else if (
        code === 'auth/unauthorized-domain' ||
        rawMsg.includes('unauthorized-domain')
      ) {
        setErrorMsg(
          `النطاق الحالي (${window.location.hostname}) غير مضاف ضمن النطاقات المصرّح بها (Authorized Domains) في إعدادات Firebase Authentication.`
        );
      } else {
        setErrorMsg(rawMsg);
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    setErrorMsg(null);
    try {
      await signOut(auth);
      setHasUnsavedChanges(false);
      onNotify('تم تسجيل الخروج بنجاح');
    } catch {
      setErrorMsg('تعذر تسجيل الخروج حالياً');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSaveToFirebase = async () => {
    if (!authUser || !isAdmin) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await saveAllPortfolioToFirestore(draft, authUser.uid);
      setHasUnsavedChanges(false);
      onNotify('تم حفظ جميع التغييرات في Firebase بنجاح');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'حدث خطأ أثناء الحفظ في Firebase';
      setErrorMsg(message);
      onNotify('تعذر الحفظ في Firebase، تحقق من التفاصيل');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaultsInFirebase = async () => {
    if (!authUser || !isAdmin) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await seedOrResetFirestoreDefaults(authUser.uid);
      setHasUnsavedChanges(false);
      setConfirmReset(false);
      onNotify('تمت مزامنة البيانات الافتراضية في Firebase');
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : 'فشل استعادة البيانات في Firebase'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = async () => {
    const jsonString = JSON.stringify(draft, null, 2);
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
      const compressed = await compressImageToDataUrl(file);
      updateDraft((prev) => ({
        ...prev,
        profile: { ...prev.profile, profileImage: compressed },
      }));
      onNotify('تم تجهيز الصورة الشخصية — اضغط "حفظ في Firebase" للاعتماد');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'تعذر قراءة ملف الصورة');
    }
  };

  const handleProjectImageUpload = async (
    projectId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageToDataUrl(file);
      updateDraft((prev) => ({
        ...prev,
        projects: prev.projects.map((p) =>
          p.id === projectId ? { ...p, image: compressed } : p
        ),
      }));
      onNotify('تم تجهيز صورة المشروع — اضغط "حفظ في Firebase" للاعتماد');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'تعذر معالجة صورة المشروع');
    }
  };

  // إدارة المشاريع في المسودة
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
      githubUrl: draft.contact.github,
    };
    updateDraft((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
    }));
  };

  const updateProject = (id: string, patch: Partial<ProjectItem>) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const deleteProject = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id),
    }));
  };

  // إدارة الخدمات في المسودة
  const addService = () => {
    const newService: ServiceItem = {
      id: `service-${Date.now()}`,
      title: 'خدمة تقنية جديدة',
      description: 'وصف واضح للخدمة وما تقدمه للعميل.',
      icon: 'code',
      deliverables: ['تنفيذ احترافي وفق المتطلبات', 'دعم فني وتوثيق'],
    };
    updateDraft((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  };

  const updateService = (id: string, patch: Partial<ServiceItem>) => {
    updateDraft((prev) => ({
      ...prev,
      services: prev.services.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  const deleteService = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  };

  // إدارة المهارات في المسودة
  const addSkill = () => {
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      title: 'مهارة تقنية جديدة',
      description: 'نبذة مختصرة عن الخبرة في هذه التقنية.',
      icon: 'terminal',
      technologies: ['Technology 1', 'Technology 2'],
    };
    updateDraft((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const updateSkill = (id: string, patch: Partial<SkillItem>) => {
    updateDraft((prev) => ({
      ...prev,
      skills: prev.skills.map((sk) => (sk.id === id ? { ...sk, ...patch } : sk)),
    }));
  };

  const deleteSkill = (id: string) => {
    updateDraft((prev) => ({
      ...prev,
      skills: prev.skills.filter((sk) => sk.id !== id),
    }));
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
        {/* ترويسة لوحة التحكم */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] bg-[#0A0A0C] px-5 py-4">
          <div className="flex items-center gap-3">
            <Cloud className="h-5 w-5 text-[#D4AF37]" aria-hidden="true" />
            <div>
              <h2 id="admin-modal-title" className="text-base sm:text-lg font-bold text-white">
                لوحة التحكم — Firebase
              </h2>
              {authUser && isAdmin && (
                <p dir="ltr" className="text-right font-mono-code text-[11px] text-zinc-400">
                  {authUser.email}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isAuthLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121216] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-[#D4AF37]/50 hover:text-white disabled:opacity-50"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>تسجيل الخروج</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق لوحة التحكم"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#121216] text-zinc-300 hover:border-[#D4AF37] hover:text-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* حالة انتظار المصادقة أو شاشة تسجيل الدخول عبر Google */}
        {!authReady ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-300">
            <Loader2 className="h-7 w-7 animate-spin text-[#D4AF37]" aria-hidden="true" />
            <p className="text-sm">جاري التحقق من حالة Firebase Auth...</p>
          </div>
        ) : !authUser ? (
          <div className="mx-auto my-12 w-full max-w-md space-y-6 px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F3E5AB]">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                تسجيل الدخول لإدارة الموقع
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                لوحة التحكم مربوطة بقاعدة بيانات <strong className="text-zinc-200">Firebase Firestore</strong>. سجّل الدخول بحساب مدير الموقع (<span dir="ltr" className="font-mono-code text-[#F3E5AB]">{ADMIN_EMAIL}</span>) لحفظ التعديلات ومزامنتها فوراً لجميع الزوار.
              </p>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3.5 text-xs leading-relaxed text-rose-200 text-right">
                {errorMsg}
              </div>
            )}

            <div className="space-y-3">
              {/* زر Google Identity Services المباشر */}
              <div
                ref={gsiContainerRef}
                className="flex min-h-[44px] items-center justify-center"
              />

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-white/10" />
                <span className="mx-3 text-[11px] text-zinc-500">أو</span>
                <div className="flex-grow border-t border-white/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAuthLoading}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl gold-gradient-bg px-5 py-3 text-sm font-bold text-[#0A0A0C] transition-transform duration-150 hover:scale-[1.01] disabled:opacity-60"
              >
                {isAuthLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Cloud className="h-4 w-4" aria-hidden="true" />
                )}
                <span>تسجيل الدخول بحساب Google (Firebase Popup)</span>
              </button>
            </div>
          </div>
        ) : !isAdmin ? (
          <div className="mx-auto my-12 w-full max-w-md space-y-5 px-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white">حساب غير مخوّل للتعديل</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-zinc-400">
                أنت مسجل حالياً بالبريد{' '}
                <span dir="ltr" className="font-mono-code text-zinc-200">
                  {authUser.email}
                </span>
                . التعديل والنشر في Firebase مقتصر على مالك البورتفوليو فقط.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#0A0A0C] px-5 py-2.5 text-sm font-bold text-[#F3E5AB] hover:bg-[#D4AF37]/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>تسجيل الخروج وتبديل الحساب</span>
            </button>
          </div>
        ) : (
          <>
            {/* شريط التبويبات والإجراءات */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-[#16161B] px-5 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'projects', label: `المشاريع (${draft.projects.length})` },
                    { id: 'services', label: `الخدمات (${draft.services.length})` },
                    { id: 'skills', label: `المهارات (${draft.skills.length})` },
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
                  onClick={handleSaveToFirebase}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-60 ${
                    hasUnsavedChanges
                      ? 'gold-gradient-bg text-[#0A0A0C] shadow-lg shadow-[#D4AF37]/25'
                      : 'border border-[#D4AF37]/50 bg-[#0A0A0C] text-[#F3E5AB] hover:bg-[#D4AF37]/15'
                  }`}
                >
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>
                    {hasUnsavedChanges
                      ? 'حفظ التغييرات في Firebase'
                      : 'مزامنة وحفظ في Firebase'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0A0A0C] px-3 py-1.5 text-xs font-medium text-zinc-200 hover:border-[#D4AF37]/40 hover:text-[#F3E5AB]"
                >
                  {copiedJson ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                      <span>تم التصدير</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>تصدير JSON</span>
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
                    onClick={handleResetDefaultsInFirebase}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-500 disabled:opacity-60"
                  >
                    <span>تأكيد الاستعادة في Firebase</span>
                  </button>
                )}
              </div>
            </div>

            {/* محتوى التبويب النشط */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {errorMsg && (
                <div className="rounded-xl border border-rose-500/35 bg-rose-950/30 px-4 py-3 text-xs text-rose-200 break-words">
                  {errorMsg}
                </div>
              )}

              {/* تنبيه حالة الربط مع Firebase */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06] px-4 py-3 text-xs leading-relaxed text-zinc-200">
                <div>
                  {isFullySeeded ? (
                    <span>
                      متصل بـ <strong>Firebase Firestore</strong> — أي تعديل تضغط له <strong>حفظ في Firebase</strong> يُحدَّث مباشرة لجميع الزوار في الوقت الفعلي.
                    </span>
                  ) : (
                    <span>
                      قاعدة بيانات Firestore جاهزة! اضغط على <strong>حفظ في Firebase</strong> لرفع البيانات الحالية وتفعيل التعديل السحابي المباشر.
                    </span>
                  )}
                </div>
                {hasUnsavedChanges && (
                  <span className="font-bold text-[#F3E5AB]">
                    توجد تعديلات بانتظار الحفظ
                  </span>
                )}
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
                    {draft.projects.map((project) => (
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
                              مسار الصورة أو رابطها (أو ارفع صورة مضغوطة لـ Firebase)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                dir="ltr"
                                value={
                                  project.image.startsWith('data:')
                                    ? 'صورة مرفوعة ومضغوطة (DataURL)'
                                    : project.image
                                }
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
                          <label className="block text-xs text-zinc-400">
                            الوصف الكامل في نافذة التفاصيل
                          </label>
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
                            <label className="block text-xs text-zinc-400">
                              رابط المعاينة (اختياري)
                            </label>
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
                            <label className="block text-xs text-zinc-400">
                              رابط GitHub (اختياري)
                            </label>
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
                    {draft.services.map((service) => (
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
                    {draft.skills.map((skill) => (
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
                        src={draft.profile.profileImage}
                        alt={draft.profile.fullName}
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
                              draft.profile.profileImage.startsWith('data:')
                                ? 'صورة مرفوعة ومضغوطة (DataURL)'
                                : draft.profile.profileImage
                            }
                            onChange={(e) =>
                              updateDraft((prev) => ({
                                ...prev,
                                profile: {
                                  ...prev.profile,
                                  profileImage: e.target.value,
                                },
                              }))
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
                        <label className="block text-xs text-zinc-400">
                          الاسم الكامل (بالعربية)
                        </label>
                        <input
                          type="text"
                          value={draft.profile.fullName}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, fullName: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          الاسم بالإنجليزية (SEO)
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={draft.profile.englishName}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              profile: { ...prev.profile, englishName: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-sm font-mono-code text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="block text-xs text-zinc-400">
                          نص الشارة أسفل الصورة الشخصية
                        </label>
                        <input
                          type="text"
                          value={draft.profile.floatingBadgeText}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              profile: {
                                ...prev.profile,
                                floatingBadgeText: e.target.value,
                              },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs text-zinc-400">
                        النبذة المختصرة في الواجهة الرئيسية
                      </label>
                      <textarea
                        rows={2}
                        value={draft.profile.heroBio}
                        onChange={(e) =>
                          updateDraft((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, heroBio: e.target.value },
                          }))
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
                          value={draft.contact.siteUrl}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, siteUrl: e.target.value },
                            }))
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
                          value={draft.contact.email}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, email: e.target.value },
                            }))
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
                          value={draft.contact.whatsapp}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, whatsapp: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">رابط GitHub</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={draft.contact.github}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, github: e.target.value },
                            }))
                          }
                          className="w-full rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs text-zinc-400">
                          رابط LinkedIn (اختياري)
                        </label>
                        <input
                          type="url"
                          dir="ltr"
                          value={draft.contact.linkedin ?? ''}
                          onChange={(e) =>
                            updateDraft((prev) => ({
                              ...prev,
                              contact: { ...prev.contact, linkedin: e.target.value },
                            }))
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
