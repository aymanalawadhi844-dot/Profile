import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import {
  defaultPortfolioData,
  type PortfolioData,
  type ProjectCategory,
  type ProjectItem,
  type ServiceItem,
  type SkillItem,
} from '../data/portfolioData';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const ADMIN_EMAIL = 'aymanalawadhi844@gmail.com';

const VALID_CATEGORIES: ProjectCategory[] = [
  'الويب',
  'Flutter',
  'قواعد البيانات',
  'الشبكات',
];

function clampString(val: unknown, maxLen: number, fallback = ''): string {
  const str = typeof val === 'string' ? val.trim() : fallback;
  return str.slice(0, maxLen);
}

function clampNonEmpty(val: unknown, maxLen: number, fallback: string): string {
  const trimmed = clampString(val, maxLen, fallback);
  return trimmed.length > 0 ? trimmed : fallback.slice(0, maxLen);
}

function clampStringArray(val: unknown, maxItems: number, maxItemLen = 120): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, maxItemLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function sanitizeId(raw: string, prefix: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 128);
  return cleaned.length > 0 ? cleaned : `${prefix}-${Date.now()}`;
}

export function isAuthorizedAdmin(user: User | null): boolean {
  if (!user || !user.emailVerified) return false;
  return user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

/**
 * ضغط الصور المرفوعة محلياً قبل حفظها في Firestore لتبقى ضمن حدود الحجم الآمنة (< 220KB)
 */
export function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر معالجة الصورة'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.78);
        if (compressed.length > 240000) {
          const smaller = canvas.toDataURL('image/jpeg', 0.55);
          if (smaller.length > 245000) {
            reject(
              new Error(
                'حجم الصورة كبير جداً بعد الضغط، يرجى اختيار صورة أصغر أو استخدام رابط/مسار من مجلد public'
              )
            );
            return;
          }
          resolve(smaller);
          return;
        }
        resolve(compressed);
      };
      img.onerror = () => reject(new Error('ملف الصورة غير صالح'));
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      } else {
        reject(new Error('تعذر قراءة الصورة'));
      }
    };
    reader.onerror = () => reject(new Error('تعذر قراءة الملف'));
    reader.readAsDataURL(file);
  });
}

function buildSiteSettingsPayload(data: PortfolioData, uid: string) {
  const { profile, stats, developerCard, contact } = data;
  return {
    profile: {
      greeting: clampNonEmpty(profile.greeting, 200, defaultPortfolioData.profile.greeting),
      fullName: clampNonEmpty(profile.fullName, 160, defaultPortfolioData.profile.fullName),
      englishName: clampString(profile.englishName, 160),
      brandTitle: clampNonEmpty(profile.brandTitle, 100, defaultPortfolioData.profile.brandTitle),
      roleTitles: clampStringArray(profile.roleTitles, 10, 120),
      heroBio: clampNonEmpty(profile.heroBio, 1000, defaultPortfolioData.profile.heroBio),
      aboutHeading: clampNonEmpty(
        profile.aboutHeading,
        300,
        defaultPortfolioData.profile.aboutHeading
      ),
      aboutParagraphs: clampStringArray(profile.aboutParagraphs, 10, 600),
      profileImage: clampString(profile.profileImage, 250000),
      floatingBadgeText: clampString(profile.floatingBadgeText, 120),
    },
    stats: (Array.isArray(stats) ? stats : defaultPortfolioData.stats)
      .slice(0, 6)
      .map((item, idx) => ({
        id: sanitizeId(item.id || `stat-${idx}`, 'stat'),
        value: clampNonEmpty(item.value, 32, '0'),
        label: clampNonEmpty(item.label, 80, 'إحصائية'),
      })),
    developerCard: {
      name: clampNonEmpty(
        developerCard.name,
        200,
        defaultPortfolioData.developerCard.name
      ),
      role: clampNonEmpty(
        developerCard.role,
        200,
        defaultPortfolioData.developerCard.role
      ),
      mobile: clampStringArray(developerCard.mobile, 10, 60),
      languages: clampStringArray(developerCard.languages, 10, 60),
      databases: clampStringArray(developerCard.databases, 10, 60),
      focus: clampNonEmpty(
        developerCard.focus,
        200,
        defaultPortfolioData.developerCard.focus
      ),
    },
    contact: {
      siteUrl: clampString(contact.siteUrl, 300),
      email: clampNonEmpty(contact.email, 200, defaultPortfolioData.contact.email),
      whatsapp: clampNonEmpty(contact.whatsapp, 40, defaultPortfolioData.contact.whatsapp),
      github: clampString(contact.github, 300),
      linkedin: clampString(contact.linkedin ?? '', 300),
      location: clampString(contact.location, 200),
    },
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  };
}

function buildProjectPayload(project: ProjectItem, sortOrder: number, uid: string) {
  const safeId = sanitizeId(project.id, 'project');
  const category = VALID_CATEGORIES.includes(project.category)
    ? project.category
    : 'الويب';
  return {
    id: safeId,
    title: clampNonEmpty(project.title, 200, 'مشروع برمجي'),
    category,
    year: clampNonEmpty(project.year, 20, String(new Date().getFullYear())),
    summary: clampNonEmpty(project.summary, 500, 'ملخص المشروع'),
    description: clampNonEmpty(project.description, 4000, 'تفاصيل المشروع'),
    image: clampString(project.image, 250000),
    technologies: clampStringArray(project.technologies, 15, 80),
    highlights: clampStringArray(project.highlights, 15, 250),
    liveUrl: clampString(project.liveUrl ?? '', 500),
    githubUrl: clampString(project.githubUrl ?? '', 500),
    sortOrder,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  };
}

function buildServicePayload(service: ServiceItem, sortOrder: number, uid: string) {
  const safeId = sanitizeId(service.id, 'service');
  return {
    id: safeId,
    title: clampNonEmpty(service.title, 200, 'خدمة تقنية'),
    description: clampNonEmpty(service.description, 1000, 'وصف الخدمة'),
    icon: clampNonEmpty(service.icon, 40, 'code'),
    deliverables: clampStringArray(service.deliverables, 15, 250),
    sortOrder,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  };
}

function buildSkillPayload(skill: SkillItem, sortOrder: number, uid: string) {
  const safeId = sanitizeId(skill.id, 'skill');
  return {
    id: safeId,
    title: clampNonEmpty(skill.title, 200, 'مهارة تقنية'),
    description: clampNonEmpty(skill.description, 1000, 'وصف المهارة'),
    icon: clampNonEmpty(skill.icon, 40, 'code'),
    technologies: clampStringArray(skill.technologies, 20, 80),
    sortOrder,
    updatedAt: serverTimestamp(),
    updatedBy: uid,
  };
}

export interface FirestoreSyncState {
  hasRemoteSettings: boolean;
  hasRemoteProjects: boolean;
  hasRemoteServices: boolean;
  hasRemoteSkills: boolean;
}

export function subscribeToPortfolio(
  onUpdate: (
    partial: Partial<PortfolioData>,
    syncFlags: Partial<FirestoreSyncState>
  ) => void
): Unsubscribe {
  const unsubSettings = onSnapshot(
    doc(db, 'siteSettings', 'main'),
    (snap) => {
      if (snap.exists()) {
        const remote = snap.data();
        onUpdate(
          {
            profile: {
              ...defaultPortfolioData.profile,
              ...(remote.profile ?? {}),
            },
            stats: Array.isArray(remote.stats)
              ? remote.stats
              : defaultPortfolioData.stats,
            developerCard: {
              ...defaultPortfolioData.developerCard,
              ...(remote.developerCard ?? {}),
            },
            contact: {
              ...defaultPortfolioData.contact,
              ...(remote.contact ?? {}),
            },
          },
          { hasRemoteSettings: true }
        );
      } else {
        onUpdate({}, { hasRemoteSettings: false });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, 'siteSettings/main');
    }
  );

  const unsubProjects = onSnapshot(
    query(collection(db, 'projects'), orderBy('sortOrder', 'asc')),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: ProjectItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            category: VALID_CATEGORIES.includes(data.category)
              ? data.category
              : 'الويب',
            year: String(data.year ?? '2026'),
            summary: String(data.summary ?? ''),
            description: String(data.description ?? ''),
            image: String(data.image ?? ''),
            technologies: Array.isArray(data.technologies) ? data.technologies : [],
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            liveUrl: data.liveUrl ? String(data.liveUrl) : '',
            githubUrl: data.githubUrl ? String(data.githubUrl) : '',
          };
        });
        onUpdate({ projects: items }, { hasRemoteProjects: true });
      } else {
        onUpdate({}, { hasRemoteProjects: false });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'projects');
    }
  );

  const unsubServices = onSnapshot(
    query(collection(db, 'services'), orderBy('sortOrder', 'asc')),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: ServiceItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            icon: (data.icon ?? 'code') as ServiceItem['icon'],
            deliverables: Array.isArray(data.deliverables) ? data.deliverables : [],
          };
        });
        onUpdate({ services: items }, { hasRemoteServices: true });
      } else {
        onUpdate({}, { hasRemoteServices: false });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    }
  );

  const unsubSkills = onSnapshot(
    query(collection(db, 'skills'), orderBy('sortOrder', 'asc')),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: SkillItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: String(data.title ?? ''),
            description: String(data.description ?? ''),
            icon: (data.icon ?? 'code') as SkillItem['icon'],
            technologies: Array.isArray(data.technologies) ? data.technologies : [],
          };
        });
        onUpdate({ skills: items }, { hasRemoteSkills: true });
      } else {
        onUpdate({}, { hasRemoteSkills: false });
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'skills');
    }
  );

  return () => {
    unsubSettings();
    unsubProjects();
    unsubServices();
    unsubSkills();
  };
}

export async function saveAllPortfolioToFirestore(
  data: PortfolioData,
  uid: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // 1. الإعدادات العامة
    batch.set(doc(db, 'siteSettings', 'main'), buildSiteSettingsPayload(data, uid));

    // 2. حذف البطاقات المحذوفة ومزامنة الحالية لكل مجموعة
    const [existingProjects, existingServices, existingSkills] = await Promise.all([
      getDocs(collection(db, 'projects')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'skills')),
    ]);

    const nextProjectIds = new Set(data.projects.map((p) => sanitizeId(p.id, 'project')));
    existingProjects.docs.forEach((docSnap) => {
      if (!nextProjectIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });
    data.projects.forEach((project, idx) => {
      const payload = buildProjectPayload(project, idx, uid);
      batch.set(doc(db, 'projects', payload.id), payload);
    });

    const nextServiceIds = new Set(data.services.map((s) => sanitizeId(s.id, 'service')));
    existingServices.docs.forEach((docSnap) => {
      if (!nextServiceIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });
    data.services.forEach((service, idx) => {
      const payload = buildServicePayload(service, idx, uid);
      batch.set(doc(db, 'services', payload.id), payload);
    });

    const nextSkillIds = new Set(data.skills.map((sk) => sanitizeId(sk.id, 'skill')));
    existingSkills.docs.forEach((docSnap) => {
      if (!nextSkillIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });
    data.skills.forEach((skill, idx) => {
      const payload = buildSkillPayload(skill, idx, uid);
      batch.set(doc(db, 'skills', payload.id), payload);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/main');
  }
}

export async function saveProjectToFirestore(
  project: ProjectItem,
  sortOrder: number,
  uid: string
): Promise<void> {
  const payload = buildProjectPayload(project, sortOrder, uid);
  const path = `projects/${payload.id}`;
  try {
    await setDoc(doc(db, 'projects', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProjectFromFirestore(projectId: string): Promise<void> {
  const safeId = sanitizeId(projectId, 'project');
  const path = `projects/${safeId}`;
  try {
    await deleteDoc(doc(db, 'projects', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveServiceToFirestore(
  service: ServiceItem,
  sortOrder: number,
  uid: string
): Promise<void> {
  const payload = buildServicePayload(service, sortOrder, uid);
  const path = `services/${payload.id}`;
  try {
    await setDoc(doc(db, 'services', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceFromFirestore(serviceId: string): Promise<void> {
  const safeId = sanitizeId(serviceId, 'service');
  const path = `services/${safeId}`;
  try {
    await deleteDoc(doc(db, 'services', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSkillToFirestore(
  skill: SkillItem,
  sortOrder: number,
  uid: string
): Promise<void> {
  const payload = buildSkillPayload(skill, sortOrder, uid);
  const path = `skills/${payload.id}`;
  try {
    await setDoc(doc(db, 'skills', payload.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSkillFromFirestore(skillId: string): Promise<void> {
  const safeId = sanitizeId(skillId, 'skill');
  const path = `skills/${safeId}`;
  try {
    await deleteDoc(doc(db, 'skills', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedOrResetFirestoreDefaults(uid: string): Promise<void> {
  await saveAllPortfolioToFirestore(defaultPortfolioData, uid);
}
