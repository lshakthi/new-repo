import { CheckCircle2, AlertCircle, AlertTriangle, HelpCircle, MinusCircle } from 'lucide-react';
import type { EvidenceStrengthType } from './tokens';
import { evidenceLabels } from './tokens';

interface ConfidenceBadgeProps {
  level: EvidenceStrengthType;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const levelConfig: Record<EvidenceStrengthType, {
  icon: typeof CheckCircle2;
  classes: string;
  ariaPrefix: string;
}> = {
  strong: {
    icon: CheckCircle2,
    classes: 'bg-evidence-strong-bg text-evidence-strong border-evidence-strong/20',
    ariaPrefix: 'High confidence:',
  },
  moderate: {
    icon: AlertCircle,
    classes: 'bg-evidence-moderate-bg text-evidence-moderate border-evidence-moderate/20',
    ariaPrefix: 'Moderate confidence:',
  },
  weak: {
    icon: AlertTriangle,
    classes: 'bg-evidence-weak-bg text-evidence-weak border-evidence-weak/20',
    ariaPrefix: 'Low confidence:',
  },
  conflict: {
    icon: HelpCircle,
    classes: 'bg-evidence-conflict-bg text-evidence-conflict border-evidence-conflict/20',
    ariaPrefix: 'Conflicting evidence:',
  },
  missing: {
    icon: MinusCircle,
    classes: 'bg-evidence-missing-bg text-evidence-missing border-evidence-missing/20',
    ariaPrefix: 'No evidence:',
  },
};

export function ConfidenceBadge({ level, showLabel = true, size = 'md' }: ConfidenceBadgeProps) {
  const config = levelConfig[level];
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-sm gap-1.5';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${config.classes} ${sizeClasses}`}
      role="status"
      aria-label={`${config.ariaPrefix} ${evidenceLabels[level]}`}
    >
      <Icon size={iconSize} aria-hidden="true" />
      {showLabel && <span>{evidenceLabels[level]}</span>}
    </span>
  );
}
