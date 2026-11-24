import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
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
import { auth } from './firebase';
import {
  subscribeToPortfolio,
  type FirestoreSyncState,
} from './services/portfolioFirestore';

function loadCachedPortfolioData(): PortfolioData {
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
    loadCachedPortfolioData()
  );
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncState, setSyncState] = useState<FirestoreSyncState>({
    hasRemoteSettings: false,
    hasRemoteProjects: false,
    hasRemoteServices: false,
    hasRemoteSkills: false,
  });
  const [selectedService, setSelectedService] = useState<string>('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // مراقبة حالة تسجيل الدخول في Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // الاستماع للتحديثات الفورية من Firebase Firestore
  useEffect(() => {
    const unsubscribe = subscribeToPortfolio((partial, flags) => {
      setSyncState((prev) => ({ ...prev, ...flags }));
      if (Object.keys(partial).length > 0) {
        setPortfolioData((prev) => ({
          ...prev,
          ...partial,
        }));
      }
    });
    return () => unsubscribe();
  }, []);

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

  // تخزين نسخة محلية للتحميل السريع
  useEffect(() => {
    try {
      window.localStorage.setItem(
        PORTFOLIO_STORAGE_KEY,
        JSON.stringify(portfolioData)
      );
    } catch {
      // تجاهل في حال امتلاء المساحة المحلية
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
        authUser={authUser}
        authReady={authReady}
        syncState={syncState}
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
