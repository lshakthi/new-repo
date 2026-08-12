import { ExternalLink, BookOpen, Database, FileText } from 'lucide-react';

export type SourceType = 'pubmed' | 'database' | 'trial' | 'patent' | 'preprint' | 'web';

interface CitationChipProps {
  id: string;
  label: string;
  sourceType: SourceType;
  onClick?: (id: string) => void;
  isActive?: boolean;
}

const sourceIcons: Record<SourceType, typeof BookOpen> = {
  pubmed: BookOpen,
  database: Database,
  trial: FileText,
  patent: FileText,
  preprint: BookOpen,
  web: ExternalLink,
};

const sourceColors: Record<SourceType, string> = {
  pubmed: 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100',
  database: 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100',
  trial: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100',
  patent: 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100',
  preprint: 'bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100',
  web: 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100',
};

export function CitationChip({ id, label, sourceType, onClick, isActive }: CitationChipProps) {
  const Icon = sourceIcons[sourceType];
  const colorClasses = sourceColors[sourceType];

  return (
    <button
      onClick={() => onClick?.(id)}
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
        border cursor-pointer transition-all duration-150
        ${colorClasses}
        ${isActive ? 'ring-2 ring-offset-1 ring-cei-blue-light' : ''}
      `}
      aria-label={`View source: ${label}`}
      title={label}
    >
      <Icon size={11} aria-hidden="true" />
      <span className="max-w-[120px] truncate">{label}</span>
    </button>
  );
}
