import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  brandTitle: string;
}

const NAV_LINKS = [
  { href: '#hero', label: 'الرئيسية' },
  { href: '#about', label: 'من أنا' },
  { href: '#skills', label: 'مهاراتي' },
  { href: '#services', label: 'خدماتي' },
  { href: '#projects', label: 'مشاريعي' },
  { href: '#contact', label: 'تواصل معي' },
];

export function Navbar({ brandTitle }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-40 border-b border-white/[0.07] bg-[#0A0A0C]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* الشعار + أيقونة الحرف الذهبية في اليمين */}
        <a
          href="#hero"
          className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-white transition-colors hover:text-[#F3E5AB] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
        >
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg gold-gradient-bg p-[1.5px] shadow-md shadow-[#D4AF37]/15"
          >
            <span className="flex h-full w-full items-center justify-center rounded-[6.5px] bg-[#0A0A0C]">
              <span className="gold-gradient-text text-base font-extrabold leading-none -mt-0.5">
                أ
              </span>
            </span>
          </span>
          <span className="gold-gradient-text">{brandTitle}</span>
        </a>

        {/* روابط التنقل السلسة */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-300"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors duration-150 hover:text-[#F3E5AB] whitespace-nowrap shrink-0 after:absolute after:bottom-0 after:right-0 after:h-[1.5px] after:w-0 after:bg-[#D4AF37] after:transition-all after:duration-200 hover:after:w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF37]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* زر الإجراء الأساسي + قائمة الجوال */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center justify-center rounded-lg gold-gradient-bg px-4 py-2 text-xs font-bold text-[#0A0A0C] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
          >
            ابدأ مشروعك
          </a>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-[#121216] text-zinc-200 transition-colors hover:border-[#D4AF37]/50 hover:text-[#F3E5AB]"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* قائمة الجوال المنسدلة */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/[0.08] bg-[#0A0A0C]/95 backdrop-blur-xl">
          <nav
            aria-label="التنقل للجوال"
            className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-200 transition-colors hover:bg-[#121216] hover:text-[#F3E5AB]"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={handleLinkClick}
              className="mt-2 inline-flex items-center justify-center rounded-lg gold-gradient-bg px-4 py-2.5 text-sm font-bold text-[#0A0A0C]"
            >
              ابدأ مشروعك
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
