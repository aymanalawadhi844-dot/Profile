import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  FolderGit2,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from 'lucide-react';
import type { ContactConfig, ServiceItem } from '../data/portfolioData';

interface ContactSectionProps {
  contact: ContactConfig;
  services: ServiceItem[];
  selectedService: string;
  onSelectService: (service: string) => void;
  onNotify: (message: string) => void;
}

function sanitizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function ContactSection({
  contact,
  services,
  selectedService,
  onSelectService,
  onNotify,
}: ContactSectionProps) {
  const [name, setName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const serviceOptions = useMemo(() => {
    const base = services.map((s) => s.title);
    const extras = ['استشارة تقنية عامة', 'مشروع برمجي مخصص'];
    const combined = [...base, ...extras];
    if (selectedService && !combined.includes(selectedService)) {
      combined.unshift(selectedService);
    }
    return combined;
  }, [services, selectedService]);

  const activeSubject = selectedService || serviceOptions[0] || 'استشارة تقنية عامة';

  useEffect(() => {
    if (selectedService) {
      setSubmittedNotice(false);
    }
  }, [selectedService]);

  const cleanWhatsapp = sanitizePhone(contact.whatsapp);

  const quickWhatsappMessage = selectedService
    ? `السلام عليكم أستاذ أيمن، أود الاستفسار وطلب خدمة: (${selectedService}).`
    : 'السلام عليكم أستاذ أيمن، اطلعت على معرض أعمالك وأرغب في التواصل معك بشأن مشروع برمجي.';

  const quickWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    quickWhatsappMessage
  )}`;

  const formWhatsappMessage = [
    'السلام عليكم أستاذ أيمن،',
    name ? `الاسم: ${name}` : '',
    senderEmail ? `البريد الإلكتروني: ${senderEmail}` : '',
    `الخدمة المطلوبة: ${activeSubject}`,
    message ? `التفاصيل: ${message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const formWhatsappUrl = `https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
    formWhatsappMessage
  )}`;

  const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(
    `طلب خدمة: ${activeSubject}`
  )}&body=${encodeURIComponent(formWhatsappMessage)}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopiedEmail(true);
      onNotify('تم نسخ البريد الإلكتروني');
      window.setTimeout(() => setCopiedEmail(false), 2200);
    } catch {
      onNotify(`البريد الإلكتروني: ${contact.email}`);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmittedNotice(true);
    onNotify('تم تجهيز رسالتك — يمكنك إرسالها مباشرة عبر واتساب أو البريد الإلكتروني');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2 mb-10 sm:mb-12">
          <p className="text-sm font-semibold text-[#D4AF37]">تواصل معي</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
            هل لديك فكرة مشروع أو خدمة تقنية؟ دعنا نبدأ التنفيذ
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* بطاقة معلومات التواصل المباشر */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121216] p-6 sm:p-7 space-y-6">
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white">قنوات التواصل المباشرة</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                اختر الوسيلة الأنسب لك للتواصل السريع ومناقشة متطلبات مشروعك أو طلب أي من الخدمات المتاحة.
              </p>

              {/* البريد الإلكتروني مع زر النسخ */}
              <div className="rounded-xl border border-white/[0.07] bg-[#0A0A0C] p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F3E5AB]">
                    <Mail className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-400">البريد الإلكتروني</div>
                    <div
                      dir="ltr"
                      className="truncate text-sm font-semibold text-white text-right"
                    >
                      {contact.email}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#D4AF37]/35 bg-[#121216] px-3 py-2 text-xs font-bold text-[#F3E5AB] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 whitespace-nowrap"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>نسخ البريد الإلكتروني</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${contact.email}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#121216] px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-[#D4AF37]/40 hover:text-white whitespace-nowrap"
                  >
                    <span>مراسلة</span>
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>

              {/* زر واتساب المباشر */}
              <a
                href={quickWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 transition-colors hover:border-emerald-400/60 hover:bg-emerald-950/35"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300">
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">مراسلة فورية عبر واتساب</div>
                    <div dir="ltr" className="text-xs text-emerald-300/90 text-right tabular-nums">
                      +{cleanWhatsapp}
                    </div>
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-emerald-300 shrink-0" aria-hidden="true" />
              </a>

              {/* روابط الحسابات المهنية */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {contact.github && (
                  <a
                    href={contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
                  >
                    <FolderGit2 className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                    <span>حساب GitHub</span>
                  </a>
                )}

                {contact.linkedin && (
                  <a
                    href={contact.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
                  >
                    <ExternalLink className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>

            {contact.location && (
              <div className="flex items-center gap-2 border-t border-white/[0.07] pt-4 text-xs text-zinc-400">
                <MapPin className="h-4 w-4 text-[#D4AF37]" aria-hidden="true" />
                <span>{contact.location}</span>
              </div>
            )}
          </div>

          {/* نموذج التواصل التفاعلي */}
          <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#121216] p-6 sm:p-7">
            <form onSubmit={handleFormSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    الاسم الكامل
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اكتب اسمك هنا"
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-2.5 text-sm text-white placeholder-zinc-500 transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-zinc-200"
                  >
                    البريد الإلكتروني
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    dir="ltr"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-2.5 text-sm text-white placeholder-zinc-500 text-right transition-colors focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-service"
                  className="block text-sm font-medium text-zinc-200"
                >
                  نوع الخدمة / الموضوع
                </label>
                <select
                  id="contact-service"
                  value={activeSubject}
                  onChange={(e) => onSelectService(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-2.5 text-sm text-[#F3E5AB] transition-colors focus:border-[#D4AF37] focus:outline-none"
                >
                  {serviceOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#121216] text-white">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-zinc-200"
                >
                  تفاصيل المشروع أو الرسالة
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اشرح باختصار فكرة المشروع أو المتطلبات الأساسية..."
                  className="w-full rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-3 text-sm text-white placeholder-zinc-500 transition-colors focus:border-[#D4AF37] focus:outline-none resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl gold-gradient-bg px-6 py-3 text-sm font-bold text-[#0A0A0C] transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] whitespace-nowrap"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>تأكيد وتجهيز الإرسال</span>
                </button>

                <a
                  href={formWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#0A0A0C] px-5 py-3 text-sm font-semibold text-[#F3E5AB] transition-colors hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <span>إرسال مباشر عبر واتساب</span>
                </a>

                <a
                  href={mailtoUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0A0A0C] px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white whitespace-nowrap"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span>عبر البريد</span>
                </a>
              </div>

              {submittedNotice && (
                <div
                  role="status"
                  className="rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 p-4 text-sm text-[#F3E5AB] space-y-2"
                >
                  <p className="font-bold">
                    تم تجهيز بيانات طلبك بنجاح لخدمة: {activeSubject}
                  </p>
                  <p className="text-xs text-zinc-200">
                    لضمان وصول الرسالة فوراً دون الاعتماد على خادم بريد خارجي، اضغط على "إرسال مباشر عبر واتساب" أو "عبر البريد" أعلاه لإكمال الإرسال بضغطة واحدة.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
