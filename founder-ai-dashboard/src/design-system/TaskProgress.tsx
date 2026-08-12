import { Check, Loader2, Circle, XCircle, Pause } from 'lucide-react';
import type { TaskStatusType } from './tokens';

export interface TaskStep {
  id: string;
  label: string;
  status: TaskStatusType;
  detail?: string;
}

interface TaskProgressProps {
  steps: TaskStep[];
  title?: string;
}

const statusConfig: Record<TaskStatusType, { icon: typeof Check; classes: string }> = {
  completed: { icon: Check, classes: 'text-success bg-success-bg border-success/30' },
  running: { icon: Loader2, classes: 'text-cei-blue-light bg-blue-50 border-cei-blue-light/30' },
  idle: { icon: Circle, classes: 'text-text-tertiary bg-surface-panel border-border-subtle' },
  partial: { icon: Pause, classes: 'text-evidence-moderate bg-evidence-moderate-bg border-evidence-moderate/30' },
  failed: { icon: XCircle, classes: 'text-evidence-weak bg-evidence-weak-bg border-evidence-weak/30' },
  awaiting_approval: { icon: Pause, classes: 'text-review-required bg-review-required-bg border-review-required/30' },
};

export function TaskProgress({ steps, title }: TaskProgressProps) {
  const completed = steps.filter(s => s.status === 'completed').length;

  return (
    <div className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          <span className="text-xs text-text-tertiary">{completed}/{steps.length} complete</span>
        </div>
      )}

      <div className="space-y-2">
        {steps.map((step) => {
          const config = statusConfig[step.status];
          const Icon = config.icon;
          const isAnimating = step.status === 'running';

          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${config.classes}`}>
                <Icon size={13} className={isAnimating ? 'animate-spin' : ''} aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm ${step.status === 'idle' ? 'text-text-tertiary' : 'text-text-primary'}`}>
                  {step.label}
                </span>
                {step.detail && (
                  <span className="text-xs text-text-tertiary ml-2">{step.detail}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
