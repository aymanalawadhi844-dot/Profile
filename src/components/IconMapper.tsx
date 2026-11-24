import {
  Code2,
  Cpu,
  Database,
  Globe,
  Layers,
  Server,
  ShieldCheck,
  Smartphone,
  Terminal,
} from 'lucide-react';
import type { IconKey } from '../data/portfolioData';

interface IconMapperProps {
  icon: IconKey;
  className?: string;
}

export function IconMapper({ icon, className = 'w-6 h-6' }: IconMapperProps) {
  switch (icon) {
    case 'globe':
      return <Globe className={className} aria-hidden="true" />;
    case 'smartphone':
      return <Smartphone className={className} aria-hidden="true" />;
    case 'code':
      return <Code2 className={className} aria-hidden="true" />;
    case 'database':
      return <Database className={className} aria-hidden="true" />;
    case 'shield':
      return <ShieldCheck className={className} aria-hidden="true" />;
    case 'layers':
      return <Layers className={className} aria-hidden="true" />;
    case 'terminal':
      return <Terminal className={className} aria-hidden="true" />;
    case 'cpu':
      return <Cpu className={className} aria-hidden="true" />;
    case 'server':
      return <Server className={className} aria-hidden="true" />;
    default:
      return <Code2 className={className} aria-hidden="true" />;
  }
}

export const ICON_OPTIONS: Array<{ value: IconKey; label: string }> = [
  { value: 'globe', label: 'تطوير الويب (Globe)' },
  { value: 'smartphone', label: 'تطبيقات الجوال (Smartphone)' },
  { value: 'code', label: 'البرمجة والكود (Code)' },
  { value: 'database', label: 'قواعد البيانات (Database)' },
  { value: 'shield', label: 'الشبكات والأمن (Shield)' },
  { value: 'layers', label: 'واجهات وتصميم (Layers)' },
  { value: 'terminal', label: 'سطر الأوامر والأنظمة (Terminal)' },
  { value: 'cpu', label: 'المعالجة والأداء (CPU)' },
  { value: 'server', label: 'الخوادم والبنية (Server)' },
];
