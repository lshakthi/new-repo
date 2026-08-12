import { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Database, Search, Cpu } from 'lucide-react';

export interface ProvenanceStep {
  id: string;
  action: string;
  source: string;
  detail?: string;
  duration?: string;
  icon?: 'search' | 'database' | 'compute';
}

interface ProvenanceTrailProps {
  steps: ProvenanceStep[];
  totalDuration?: string;
  defaultExpanded?: boolean;
}

const stepIcons = {
  search: Search,
  database: Database,
  compute: Cpu,
};

export function ProvenanceTrail({ steps, totalDuration, defaultExpanded = false }: ProvenanceTrailProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden bg-surface-elevated">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:bg-surface-panel transition-colors"
        aria-expanded={expanded}
        aria-controls="provenance-content"
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span className="font-medium">What I did</span>
        <span className="text-text-tertiary">
          {steps.length} steps
          {totalDuration && ` · ${totalDuration}`}
        </span>
      </button>

      {expanded && (
        <div id="provenance-content" className="border-t border-border-subtle px-3 py-2 space-y-2">
          {steps.map((step) => {
            const Icon = step.icon ? stepIcons[step.icon] : Search;
            return (
              <div key={step.id} className="flex items-start gap-2 text-xs">
                <Icon size={12} className="text-text-tertiary mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <span className="text-text-primary font-medium">{step.action}</span>
                  <span className="text-text-tertiary"> via {step.source}</span>
                  {step.detail && (
                    <p className="text-text-tertiary mt-0.5">{step.detail}</p>
                  )}
                </div>
                {step.duration && (
                  <span className="text-text-tertiary flex items-center gap-0.5 flex-shrink-0">
                    <Clock size={10} aria-hidden="true" />
                    {step.duration}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
