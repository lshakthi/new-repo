import { HelpCircle } from 'lucide-react';

interface UncertaintyBlockProps {
  what: string;
  resolution: string;
}

export function UncertaintyBlock({ what, resolution }: UncertaintyBlockProps) {
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-md bg-evidence-missing-bg border border-evidence-missing/15 my-2">
      <HelpCircle size={15} className="text-evidence-missing mt-0.5 flex-shrink-0" aria-hidden="true" />
      <div className="text-sm">
        <p className="text-text-primary">{what}</p>
        <p className="text-text-secondary mt-0.5 text-xs">
          <span className="font-medium">To resolve:</span> {resolution}
        </p>
      </div>
    </div>
  );
}
