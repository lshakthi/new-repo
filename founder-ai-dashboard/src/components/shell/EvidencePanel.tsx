import { X, ExternalLink, BookOpen, Calendar, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfidenceBadge } from '../../design-system';

interface SourceDetail {
  id: string;
  title: string;
  authors?: string;
  journal?: string;
  year?: string;
  database?: string;
  relevantPassage?: string;
  url?: string;
  confidence?: 'strong' | 'moderate' | 'weak';
}

// Sample source for demonstration
const sampleSource: SourceDetail = {
  id: 'pmid-38291045',
  title: 'Gain-of-function mutations in TP53 and their impact on tumor suppressor activity',
  authors: 'Zhang Y, Liu W, Chen M et al.',
  journal: 'Nature Reviews Cancer',
  year: '2024',
  relevantPassage: 'The R175H mutation in TP53 results in a gain-of-function phenotype that promotes tumor progression through enhanced cell proliferation and inhibition of apoptosis. This variant has been consistently classified as pathogenic across multiple independent studies.',
  url: 'https://pubmed.ncbi.nlm.nih.gov/38291045',
  confidence: 'strong',
};

export function EvidencePanel() {
  const { evidencePanelOpen, setEvidencePanelOpen } = useApp();

  if (!evidencePanelOpen) return null;

  // In production, this would fetch from a source store keyed by activeSourceId
  const source = sampleSource;

  return (
    <aside
      className="w-96 border-l border-border-subtle bg-surface-elevated flex flex-col h-full transition-panel overflow-hidden"
      aria-label="Evidence detail panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
        <h2 className="text-sm font-semibold text-text-primary">Source Detail</h2>
        <button
          onClick={() => setEvidencePanelOpen(false)}
          className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-panel"
          aria-label="Close evidence panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary leading-snug">{source.title}</h3>
          {source.confidence && (
            <div className="mt-2">
              <ConfidenceBadge level={source.confidence} size="sm" />
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          {source.authors && (
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <Users size={12} className="mt-0.5 flex-shrink-0 text-text-tertiary" />
              <span>{source.authors}</span>
            </div>
          )}
          {source.journal && (
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <BookOpen size={12} className="mt-0.5 flex-shrink-0 text-text-tertiary" />
              <span>{source.journal}</span>
            </div>
          )}
          {source.year && (
            <div className="flex items-start gap-2 text-xs text-text-secondary">
              <Calendar size={12} className="mt-0.5 flex-shrink-0 text-text-tertiary" />
              <span>{source.year}</span>
            </div>
          )}
        </div>

        {/* Relevant passage */}
        {source.relevantPassage && (
          <div className="bg-surface-panel border border-border-subtle rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-text-tertiary mb-1.5">
              Relevant passage
            </p>
            <p className="text-sm text-text-primary leading-relaxed">
              {source.relevantPassage}
            </p>
          </div>
        )}

        {/* Actions */}
        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-cei-blue-light hover:text-cei-blue transition-colors"
          >
            <ExternalLink size={12} />
            View full source
          </a>
        )}

        {/* Sample data notice */}
        <div className="mt-6 px-3 py-2 bg-amber-50 border border-amber-200/50 rounded-md">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700">Sample data</p>
          <p className="text-xs text-amber-600 mt-0.5">
            This source detail is shown for demonstration purposes. In production, real source content would be displayed here.
          </p>
        </div>
      </div>
    </aside>
  );
}
