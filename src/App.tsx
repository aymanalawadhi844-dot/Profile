import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { AboutSection } from './components/AboutSection';
import { AdminModal } from './components/AdminModal';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { HeroSection } from './components/HeroSection';
import { Navbar } from './components/Navbar';
import { ProjectsSection } from './components/ProjectsSection';
import { ReadingProgress } from './components/ReadingProgress';
import { ServicesSection } from './components/ServicesSection';
import { SkillsSection } from './components/SkillsSection';
import {
  defaultPortfolioData,
  PORTFOLIO_STORAGE_KEY,
  type PortfolioData,
} from './data/portfolioData';

function loadInitialPortfolioData(): PortfolioData {
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_STORAGE_KEY);
    if (!raw) return defaultPortfolioData;
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    return {
      ...defaultPortfolioData,
      ...parsed,
      profile: {
        ...defaultPortfolioData.profile,
        ...(parsed.profile ?? {}),
      },
      developerCard: {
        ...defaultPortfolioData.developerCard,
        ...(parsed.developerCard ?? {}),
      },
      contact: {
        ...defaultPortfolioData.contact,
        ...(parsed.contact ?? {}),
      },
      stats: Array.isArray(parsed.stats) ? parsed.stats : defaultPortfolioData.stats,
      skills: Array.isArray(parsed.skills) ? parsed.skills : defaultPortfolioData.skills,
      services: Array.isArray(parsed.services)
        ? parsed.services
        : defaultPortfolioData.services,
      projects: Array.isArray(parsed.projects)
        ? parsed.projects
        : defaultPortfolioData.projects,
    };
  } catch {
    return defaultPortfolioData;
  }
}

export default function App() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() =>
    loadInitialPortfolioData()
  );
  const [selectedService, setSelectedService] = useState<string>('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // مزامنة رابط canonical مع رابط الموقع الفعلي أو المحدد في البيانات
  useEffect(() => {
    const canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
    if (canonicalEl) {
      const resolvedUrl =
        portfolioData.contact.siteUrl?.trim() ||
        window.location.origin + window.location.pathname;
      canonicalEl.href = resolvedUrl.endsWith('/') ? resolvedUrl : `${resolvedUrl}/`;
    }
  }, [portfolioData.contact.siteUrl]);

  // حفظ التعديلات تلقائياً في localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(portfolioData)
      );
    } catch {
      // في حال امتلاء مساحة التخزين بصورة كبيرة جداً
    }
  }, [portfolioData]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleRequestService = useCallback((serviceTitle: string) => {
    setSelectedService(serviceTitle);
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleResetDefaults = useCallback(() => {
    try {
      window.localStorage.removeItem(PORTFOLIO_STORAGE_KEY);
    } catch {
      // تجاهل
    }
    setPortfolioData(defaultPortfolioData);
  }, []);

  return (
    <div dir="rtl" className="min-h-screen bg-[#0A0A0C] text-zinc-100">
      <ReadingProgress />
      <Navbar brandTitle={portfolioData.profile.brandTitle} />

      <main>
        <HeroSection
          profile={portfolioData.profile}
          stats={portfolioData.stats}
        />

        <AboutSection
          profile={portfolioData.profile}
          developerCard={portfolioData.developerCard}
        />

        <SkillsSection skills={portfolioData.skills} />

        <ServicesSection
          services={portfolioData.services}
          onRequestService={handleRequestService}
        />

        <ProjectsSection
          projects={portfolioData.projects}
          onRequestSimilar={handleRequestService}
        />

        <ContactSection
          contact={portfolioData.contact}
          services={portfolioData.services}
          selectedService={selectedService}
          onSelectService={setSelectedService}
          onNotify={showToast}
        />
      </main>

      <Footer
        fullName={portfolioData.profile.fullName}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <AdminModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        data={portfolioData}
        onUpdateData={setPortfolioData}
        onResetDefaults={handleResetDefaults}
        onNotify={showToast}
      />

      {/* إشعار عائم بسيط للتأكيدات */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#D4AF37]/50 bg-[#121216]/95 px-4 py-3 text-sm font-semibold text-[#F3E5AB] shadow-2xl shadow-black/70 backdrop-blur-md"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#D4AF37]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
