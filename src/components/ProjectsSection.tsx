import { useMemo, useState } from 'react';
import { ArrowUpLeft } from 'lucide-react';
import {
  PROJECT_CATEGORIES,
  type ProjectCategory,
  type ProjectItem,
} from '../data/portfolioData';
import { ProjectModal } from './ProjectModal';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  onRequestSimilar: (subject: string) => void;
}

export function ProjectsSection({
  projects,
  onRequestSimilar,
}: ProjectsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'الكل' | ProjectCategory>('الكل');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredProjects = useMemo(() => {
    if (activeCategory === 'الكل') return projects;
    return projects.filter((project) => project.category === activeCategory);
  }, [projects, activeCategory]);

  const markImageFailed = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="projects" className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10 sm:mb-12">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-semibold text-[#D4AF37]">مشاريع مختارة</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
              نماذج عملية تجمع بين جودة الهندسة البرمجية ووضوح التجربة
            </h2>
          </div>

          {/* أزرار التصفية التفاعلية */}
          <div
            role="tablist"
            aria-label="تصفية المشاريع حسب التخصص"
            className="inline-flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.08] bg-[#121216] p-1.5"
          >
            {PROJECT_CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-colors duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'gold-gradient-bg text-[#0A0A0C]'
                      : 'text-zinc-300 hover:text-[#F3E5AB]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-10 text-center">
            <p className="text-base text-zinc-300">
              لا توجد مشاريع مضافة حالياً ضمن تصنيف "{activeCategory}".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {filteredProjects.map((project) => {
              const hasFailed = failedImages[project.id] || !project.image;
              return (
                <article
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121216] transition-colors duration-200 hover:border-[#D4AF37]/45"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#18181D]">
                    {!hasFailed ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        onError={() => markImageFailed(project.id)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#18181D] to-[#0A0A0C] p-6 text-center">
                        <span className="text-lg font-bold gold-gradient-text">
                          {project.title}
                        </span>
                        <span className="mt-1 text-xs text-zinc-400">
                          {project.category} · {project.year}
                        </span>
                      </div>
                    )}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121216]/85 via-transparent to-transparent"
                    />
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-[#D4AF37]">
                      <span>{project.category}</span>
                      <span className="font-mono-code text-zinc-400 tabular-nums">
                        {project.year}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white transition-colors group-hover:text-[#F3E5AB]">
                      {project.title}
                    </h3>

                    <p className="text-sm leading-relaxed text-zinc-400 line-clamp-2">
                      {project.summary}
                    </p>

                    <div className="flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                      <span
                        dir="ltr"
                        className="truncate font-mono-code text-xs text-zinc-400"
                      >
                        {project.technologies.slice(0, 3).join(' · ')}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#F3E5AB] whitespace-nowrap shrink-0">
                        <span>التفاصيل</span>
                        <ArrowUpLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onRequestSimilar={onRequestSimilar}
      />
    </section>
  );
}
