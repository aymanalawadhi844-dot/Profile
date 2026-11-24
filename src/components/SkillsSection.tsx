import type { SkillItem } from '../data/portfolioData';
import { IconMapper } from './IconMapper';

interface SkillsSectionProps {
  skills: SkillItem[];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <section id="skills" className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2 mb-10 sm:mb-12">
          <p className="text-sm font-semibold text-[#D4AF37]">مهاراتي التقنية</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
            منظومة متكاملة من التقنيات لتنفيذ مشاريعك باحترافية
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <article
              key={skill.id}
              className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121216] p-6 transition-colors duration-200 hover:border-[#D4AF37]/40"
            >
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 text-[#F3E5AB] transition-colors group-hover:border-[#D4AF37]/50 group-hover:bg-[#D4AF37]/15">
                  <IconMapper icon={skill.icon} className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-bold text-white">{skill.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {skill.description}
                </p>
              </div>

              {skill.technologies.length > 0 && (
                <div
                  dir="ltr"
                  className="mt-5 border-t border-white/[0.07] pt-3.5 text-right font-mono-code text-xs text-[#D4AF37]"
                >
                  {skill.technologies.join(' · ')}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
