import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
      setProgress(nextProgress);
      setShowTop(scrollTop > 380);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* شريط تقدم القراءة الذهبي الرفيع في أعلى الصفحة */}
      <div
        aria-hidden="true"
        className="fixed top-0 right-0 left-0 z-50 h-[2.5px] bg-transparent pointer-events-none"
      >
        <div
          className="h-full gold-gradient-bg transition-[width] duration-150 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* زر العودة السريعة للأعلى */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="العودة إلى الأعلى"
        className={`fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#121216]/90 text-[#F3E5AB] shadow-lg shadow-black/50 backdrop-blur-md transition-all duration-200 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0A0C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${
          showTop
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-4 opacity-0 pointer-events-none'
        }`}
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" />
      </button>
    </>
  );
}
