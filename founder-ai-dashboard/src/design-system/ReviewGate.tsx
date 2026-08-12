import { ShieldAlert } from 'lucide-react';

interface ReviewGateProps {
  reviewerType: string;
  reason: string;
  acknowledged?: boolean;
  onAcknowledge?: () => void;
}

export function ReviewGate({ reviewerType, reason, acknowledged, onAcknowledge }: ReviewGateProps) {
  return (
    <div
      className="border border-review-required/30 bg-review-required-bg rounded-lg p-4 my-4"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <ShieldAlert size={20} className="text-review-required" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-review-required">
            Qualified review recommended
          </p>
          <p className="text-sm text-text-secondary mt-1">
            {reason}
          </p>
          <p className="text-xs text-text-tertiary mt-2">
            A <span className="font-medium text-text-secondary">{reviewerType}</span> should review this before it is used for a high-impact decision. This output is decision support, not professional advice.
          </p>
          {onAcknowledge && !acknowledged && (
            <button
              onClick={onAcknowledge}
              className="mt-3 text-xs font-medium text-review-required hover:text-review-required/80 underline underline-offset-2"
            >
              I understand this needs qualified review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
