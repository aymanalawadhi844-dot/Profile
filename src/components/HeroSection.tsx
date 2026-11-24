import { useEffect, useState } from 'react';
import { ArrowDownLeft, Code2, MessageCircle } from 'lucide-react';
import type { ProfileConfig, StatItem } from '../data/portfolioData';

interface HeroSectionProps {
  profile: ProfileConfig;
  stats: StatItem[];
}

export function HeroSection({ profile, stats }: HeroSectionProps) {
  const titles = profile.roleTitles.length > 0 ? profile.roleTitles : ['مطور تطبيقات الويب'];
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // إعادة ضبط حالة خطأ الصورة عند تحديث مسارها
  useEffect(() => {
    setImageError(false);
  }, [profile.profileImage]);

  // تأثير الكتابة المتحركة للتخصصات بالتتابع
  useEffect(() => {
    const currentFullText = titles[titleIndex % titles.length];

    const speed = isDeleting ? 42 : 78;
    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentFullText.length) {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        } else {
          window.setTimeout(() => setIsDeleting(true), 1600);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % titles.length);
        }
      }
    }, speed);

    return () => window.clearTimeout(timer);
  }, [displayedText, isDeleting, titleIndex, titles]);

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden"
    >
      {/* إضاءة خلفية خفيفة متدرجة */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-[#D4AF37]/[0.06] blur-3xl"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* اليمين: التعريف والاسم بالعربية والإنجليزية والتخصص المتحرك والأزرار */}
          <div className="lg:col-span-7 space-y-5 text-right">
            <p className="text-sm sm:text-base font-medium text-[#D4AF37]">
              {profile.greeting}
            </p>

            <div className="space-y-1.5">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
                {profile.fullName}
              </h1>
              {profile.englishName && (
                <p
                  dir="ltr"
                  className="text-right font-mono-code text-sm sm:text-base tracking-wider text-zinc-400"
                >
                  {profile.englishName}
                </p>
              )}
            </div>

            <div className="flex min-h-[2.5rem] items-center text-xl sm:text-2xl font-bold text-zinc-200">
              <span className="gold-gradient-text">{displayedText}</span>
              <span
                aria-hidden="true"
                className="mr-1 inline-block h-6 w-[2px] bg-[#D4AF37] animate-pulse"
              />
            </div>

            <p className="max-w-2xl text-base sm:text-lg leading-relaxed text-zinc-300">
              {profile.heroBio}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#projects"
                className="inline-flex items-center justify-center gap-2 rounded-xl gold-gradient-bg px-6 py-3 text-sm font-bold text-[#0A0A0C] shadow-lg shadow-[#D4AF37]/15 transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                <span>تصفح أعمالي</span>
                <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#121216] px-6 py-3 text-sm font-semibold text-[#F3E5AB] transition-colors duration-150 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span>تواصل معي</span>
              </a>
            </div>
          </div>

          {/* اليسار: إطار بحركة دوران ذهبية ناعمة حول الصورة الثابتة + توهج ذهبي + شارة سفلية */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="group relative flex flex-col items-center">
              {/* توهج ذهبي ناعم ينبض خلف الإطار ويزداد وضوحاً عند مرور المؤشر */}
              <div
                aria-hidden="true"
                className="animate-calm-gold-aura pointer-events-none absolute -inset-3 rounded-full bg-gradient-to-tr from-[#D4AF37]/30 via-[#F3E5AB]/20 to-[#D4AF37]/15 blur-2xl transition-all duration-300 group-hover:from-[#D4AF37]/45 group-hover:via-[#F3E5AB]/30 group-hover:blur-3xl"
              />

              {/* حاوية الإطار الخارجي مع ظل ذهبي ناعم */}
              <div className="relative rounded-full p-3.5 sm:p-4 drop-shadow-[0_0_24px_rgba(212,175,55,0.28)] transition-all duration-300 group-hover:drop-shadow-[0_0_38px_rgba(243,229,171,0.48)]">
                {/* الحلقة الدائرية الخارجية الدوارة بالتدرج الذهبي الشفاف (تدور فقط حول الصورة) */}
                <div
                  aria-hidden="true"
                  className="animate-portrait-ring-spin portrait-gold-conic-ring pointer-events-none absolute inset-0 rounded-full p-[2.5px]"
                >
                  <div className="h-full w-full rounded-full bg-[#0A0A0C]" />
                </div>

                {/* الصورة الشخصية ثابتة تماماً في الوسط بدون أي فلاتر أو دوران */}
                <div className="relative z-10 h-64 w-64 sm:h-80 sm:w-80 rounded-full p-[3px] gold-gradient-bg shadow-2xl shadow-black/75">
                  <div className="h-full w-full overflow-hidden rounded-full bg-[#18181D] ring-4 ring-[#0A0A0C]">
                    {!imageError && profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={`${profile.fullName} - ${profile.englishName}`}
                        referrerPolicy="no-referrer"
                        onError={() => setImageError(true)}
                        className="h-full w-full object-cover object-top"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-[#121216] text-center p-6">
                        <span className="text-4xl font-extrabold gold-gradient-text">
                          {profile.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((w) => w[0])
                            .join('')}
                        </span>
                        <span className="mt-2 text-xs text-zinc-400">
                          أضف صورتك في public/profile.jpg
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* الشارة السفلية الأنيقة مع حركة خفيفة عند مرور الفأرة دون تغطية الصورة */}
                <div
                  dir="ltr"
                  className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-20 inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#121216]/95 px-4 py-1.5 text-xs font-medium text-[#F3E5AB] shadow-xl shadow-black/75 backdrop-blur-md whitespace-nowrap transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[#F3E5AB]/75"
                >
                  <Code2 className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" aria-hidden="true" />
                  <span>{profile.floatingBadgeText}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* صف الإحصائيات أسفل الترويسة */}
        <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-8 sm:gap-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-xl border border-white/[0.06] bg-[#121216]/80 px-4 py-5 text-center transition-colors hover:border-[#D4AF37]/30"
            >
              <div
                dir="ltr"
                className="text-2xl sm:text-3xl font-extrabold gold-gradient-text tabular-nums"
              >
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-300">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
