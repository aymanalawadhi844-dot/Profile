import { useEffect, useState } from 'react';
import {
  ArrowUpLeft,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  X,
} from 'lucide-react';
import type { ProjectItem } from '../data/portfolioData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onRequestSimilar: (projectTitle: string) => void;
}

export function ProjectModal({
  project,
  onClose,
  onRequestSimilar,
}: ProjectModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#121216] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق نافذة تفاصيل المشروع"
          className="absolute top-4 left-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0A0A0C]/90 text-zinc-200 transition-colors hover:border-[#D4AF37] hover:text-[#F3E5AB]"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* صورة المشروع */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#18181D]">
          {!imgError && project.image ? (
            <img
              src={project.image}
              alt={project.title}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#16161B] to-[#0A0A0C] p-6 text-center">
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
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-black/30"
          />
        </div>

        {/* تفاصيل المشروع */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[#D4AF37]">
              <span>{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{project.year}</span>
            </div>

            <h3
              id="project-modal-title"
              className="text-2xl sm:text-3xl font-extrabold text-white"
            >
              {project.title}
            </h3>
          </div>

          <p className="text-base leading-relaxed text-zinc-300">
            {project.description}
          </p>

          {project.highlights.length > 0 && (
            <div className="space-y-3 border-t border-white/[0.08] pt-5">
              <h4 className="text-sm font-bold text-[#F3E5AB]">
                أبرز المميزات والإنجازات
              </h4>
              <ul className="space-y-2">
                {project.highlights.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-zinc-300"
                  >
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.technologies.length > 0 && (
            <div className="space-y-2 border-t border-white/[0.08] pt-5">
              <h4 className="text-sm font-bold text-[#F3E5AB]">
                التقنيات المستخدمة
              </h4>
              <p dir="ltr" className="text-right font-mono-code text-xs sm:text-sm text-zinc-300">
                {project.technologies.join(' · ')}
              </p>
            </div>
          )}

          {/* أزرار الروابط والطلب */}
          <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.08] pt-5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestSimilar(`مشروع مشابه لـ: ${project.title}`);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl gold-gradient-bg px-5 py-2.5 text-sm font-bold text-[#0A0A0C] transition-transform duration-150 hover:scale-[1.02]"
            >
              <span>اطلب مشروعاً مشابهاً</span>
              <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0A0A0C] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span>معاينة المشروع</span>
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-[#0A0A0C] px-4 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
              >
                <FolderGit2 className="h-4 w-4" aria-hidden="true" />
                <span>المستودع البرمجي</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
