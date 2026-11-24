import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { DeveloperSnippet, ProfileConfig } from '../data/portfolioData';

interface AboutSectionProps {
  profile: ProfileConfig;
  developerCard: DeveloperSnippet;
}

export function AboutSection({ profile, developerCard }: AboutSectionProps) {
  const [copied, setCopied] = useState(false);

  const rawCode = `const developer = {
  name: "${developerCard.name}",
  role: "${developerCard.role}",
  mobile: [${developerCard.mobile.map((m) => `"${m}"`).join(', ')}],
  languages: [${developerCard.languages.map((l) => `"${l}"`).join(', ')}],
  databases: [${developerCard.databases.map((d) => `"${d}"`).join(', ')}],
  focus: "${developerCard.focus}"
};`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(rawCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // تجاهل خطأ الحافظة في البيئات المقيدة
    }
  };

  return (
    <section id="about" className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* النبذة التعريفية */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#D4AF37]">من أنا</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug text-balance">
                {profile.aboutHeading}
              </h2>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-300">
              {profile.aboutParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* بطاقة محرر الكود التفاعلية developer.js */}
          <div className="lg:col-span-6">
            <div
              dir="ltr"
              className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#121216] shadow-2xl shadow-black/50"
            >
              {/* شريط عنوان المحرر */}
              <div className="flex items-center justify-between border-b border-white/[0.07] bg-[#16161B] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" aria-hidden="true" />
                  <span className="h-3 w-3 rounded-full bg-[#D4AF37]/80" aria-hidden="true" />
                  <span className="ml-2 font-mono-code text-xs text-zinc-300">
                    developer.js
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#0A0A0C] px-2.5 py-1 text-xs text-zinc-300 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
              </div>

              {/* محتوى الكود المنسق بالألوان */}
              <pre className="overflow-x-auto p-5 sm:p-6 font-mono-code text-xs sm:text-sm leading-7 text-zinc-200">
                <code>
                  <span className="text-[#D4AF37]">const</span>{' '}
                  <span className="text-[#F3E5AB]">developer</span>{' '}
                  <span className="text-zinc-400">=</span>{' '}
                  <span className="text-zinc-400">{'{'}</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">name</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-emerald-300">"{developerCard.name}"</span>
                  <span className="text-zinc-500">,</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">role</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-emerald-300">"{developerCard.role}"</span>
                  <span className="text-zinc-500">,</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">mobile</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-zinc-400">[</span>
                  {developerCard.mobile.map((item, idx) => (
                    <span key={item}>
                      <span className="text-amber-200">"{item}"</span>
                      {idx < developerCard.mobile.length - 1 && (
                        <span className="text-zinc-500">, </span>
                      )}
                    </span>
                  ))}
                  <span className="text-zinc-400">]</span>
                  <span className="text-zinc-500">,</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">languages</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-zinc-400">[</span>
                  {developerCard.languages.map((item, idx) => (
                    <span key={item}>
                      <span className="text-amber-200">"{item}"</span>
                      {idx < developerCard.languages.length - 1 && (
                        <span className="text-zinc-500">, </span>
                      )}
                    </span>
                  ))}
                  <span className="text-zinc-400">]</span>
                  <span className="text-zinc-500">,</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">databases</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-zinc-400">[</span>
                  {developerCard.databases.map((item, idx) => (
                    <span key={item}>
                      <span className="text-amber-200">"{item}"</span>
                      {idx < developerCard.databases.length - 1 && (
                        <span className="text-zinc-500">, </span>
                      )}
                    </span>
                  ))}
                  <span className="text-zinc-400">]</span>
                  <span className="text-zinc-500">,</span>
                  {'\n'}
                  {'  '}
                  <span className="text-sky-300">focus</span>
                  <span className="text-zinc-400">:</span>{' '}
                  <span className="text-emerald-300">"{developerCard.focus}"</span>
                  {'\n'}
                  <span className="text-zinc-400">{'};'}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
