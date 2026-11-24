import { Settings2 } from 'lucide-react';

interface FooterProps {
  fullName: string;
  onOpenAdmin: () => void;
}

export function Footer({ fullName, onOpenAdmin }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0A0C] py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p className="text-xs sm:text-sm text-zinc-400 text-center sm:text-right">
          © <span className="tabular-nums">{year}</span>{' '}
          <span className="font-semibold text-zinc-200">{fullName}</span> — جميع الحقوق محفوظة.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400">
          <a href="#hero" className="hover:text-[#F3E5AB] transition-colors">
            الرئيسية
          </a>
          <a href="#services" className="hover:text-[#F3E5AB] transition-colors">
            الخدمات
          </a>
          <a href="#projects" className="hover:text-[#F3E5AB] transition-colors">
            المشاريع
          </a>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#121216] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
          >
            <Settings2 className="h-3.5 w-3.5 text-[#D4AF37]" aria-hidden="true" />
            <span>لوحة التحكم</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
