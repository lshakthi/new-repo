import { ArrowLeftRight } from 'lucide-react';
import { CitationChip } from './CitationChip';
import type { SourceType } from './CitationChip';

interface ConflictPosition {
  position: string;
  summary: string;
  sources: Array<{ id: string; label: string; sourceType: SourceType }>;
}

interface SourceConflictViewProps {
  topic: string;
  positions: [ConflictPosition, ConflictPosition];
  onSourceClick?: (id: string) => void;
}

export function SourceConflictView({ topic, positions, onSourceClick }: SourceConflictViewProps) {
  return (
    <div className="border border-evidence-conflict/20 bg-evidence-conflict-bg/50 rounded-lg p-4 my-3">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight size={16} className="text-evidence-conflict" aria-hidden="true" />
        <span className="text-sm font-semibold text-evidence-conflict">Sources disagree on: {topic}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {positions.map((pos, i) => (
          <div key={i} className="bg-white/80 rounded-md p-3 border border-evidence-conflict/10">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-1">
              Position {i + 1}: {pos.position}
            </p>
            <p className="text-sm text-text-primary mb-2">{pos.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {pos.sources.map((src) => (
                <CitationChip
                  key={src.id}
                  id={src.id}
                  label={src.label}
                  sourceType={src.sourceType}
                  onClick={onSourceClick}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
