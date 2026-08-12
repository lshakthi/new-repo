import { AlertTriangle, Lock, FileText, Presentation, Table2 } from 'lucide-react';

type ExportFormat = 'pdf' | 'slides' | 'csv' | 'markdown' | 'docx';

interface ExportCardProps {
  title: string;
  description?: string;
  formats: ExportFormat[];
  warnings?: string[];
  isConfidential?: boolean;
  onExport?: (format: ExportFormat) => void;
}

const formatConfig: Record<ExportFormat, { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: 'PDF' },
  slides: { icon: Presentation, label: 'Slides' },
  csv: { icon: Table2, label: 'CSV' },
  markdown: { icon: FileText, label: 'Markdown' },
  docx: { icon: FileText, label: 'Word' },
};

export function ExportCard({ title, description, formats, warnings, isConfidential, onExport }: ExportCardProps) {
  return (
    <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
          {description && <p className="text-xs text-text-secondary mt-0.5">{description}</p>}
        </div>
        {isConfidential && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-confidential-bg text-confidential border border-confidential/20">
            <Lock size={11} aria-hidden="true" />
            Confidential
          </span>
        )}
      </div>

      {warnings && warnings.length > 0 && (
        <div className="mt-3 space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-evidence-moderate">
              <AlertTriangle size={12} aria-hidden="true" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {formats.map((format) => {
          const config = formatConfig[format];
          const Icon = config.icon;
          return (
            <button
              key={format}
              onClick={() => onExport?.(format)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-default text-xs font-medium text-text-secondary hover:bg-surface-panel hover:border-cei-blue-light hover:text-cei-blue transition-colors"
            >
              <Icon size={13} aria-hidden="true" />
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
