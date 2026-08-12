/**
 * Design System Tokens
 * Semantic constants for the Founder AI Science Dashboard.
 * These map to CSS custom properties defined in styles.css.
 */

export const EvidenceStrength = {
  STRONG: 'strong',
  MODERATE: 'moderate',
  WEAK: 'weak',
  CONFLICT: 'conflict',
  MISSING: 'missing',
} as const;

export type EvidenceStrengthType = typeof EvidenceStrength[keyof typeof EvidenceStrength];

export const evidenceLabels: Record<EvidenceStrengthType, string> = {
  strong: 'Strong evidence',
  moderate: 'Moderate evidence',
  weak: 'Limited evidence',
  conflict: 'Sources disagree',
  missing: 'No data available',
};

export const evidenceDescriptions: Record<EvidenceStrengthType, string> = {
  strong: 'Multiple independent sources support this claim with consistent findings.',
  moderate: 'Some supporting evidence exists, but coverage is incomplete or sources are limited.',
  weak: 'Very few sources address this directly. Treat as preliminary.',
  conflict: 'Different sources reach different conclusions. Both positions are shown below.',
  missing: 'No relevant data was found in the sources queried.',
};

export const TaskStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  PARTIAL: 'partial',
  FAILED: 'failed',
  AWAITING_APPROVAL: 'awaiting_approval',
} as const;

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus];

export const ViewMode = {
  SCIENCE: 'science',
  BUSINESS: 'business',
} as const;

export type ViewModeType = typeof ViewMode[keyof typeof ViewMode];
