import { ArrowUpLeft, Check } from 'lucide-react';
import type { ServiceItem } from '../data/portfolioData';
import { IconMapper } from './IconMapper';

interface ServicesSectionProps {
  services: ServiceItem[];
  onRequestService: (serviceTitle: string) => void;
}

export function ServicesSection({
  services,
  onRequestService,
}: ServicesSectionProps) {
  return (
    <section id="services" className="py-16 sm:py-24 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-2 mb-10 sm:mb-12">
          <p className="text-sm font-semibold text-[#D4AF37]">خدماتي</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
            حلول برمجية وتقنية مصممة خصيصاً لنجاح أعمالك
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {services.map((service, index) => (
            <article
              key={service.id}
              className="flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#121216] p-6 sm:p-7 transition-colors duration-200 hover:border-[#D4AF37]/45"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F3E5AB]">
                    <IconMapper icon={service.icon} className="h-6 w-6" />
                  </div>
                  <span className="font-mono-code text-xs text-zinc-500 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  {service.title}
                </h3>
                <p className="mt-2.5 text-sm sm:text-base leading-relaxed text-zinc-300">
                  {service.description}
                </p>

                {service.deliverables.length > 0 && (
                  <ul className="mt-5 space-y-2.5 border-t border-white/[0.07] pt-4">
                    {service.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-sm text-zinc-400"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#D4AF37]"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => onRequestService(service.title)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-[#0A0A0C] px-5 py-2.5 text-sm font-bold text-[#F3E5AB] transition-all duration-150 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                >
                  <span>اطلب الخدمة</span>
                  <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
