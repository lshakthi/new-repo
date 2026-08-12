import { useState } from 'react';
import { Pencil, Check } from 'lucide-react';

interface AssumptionInputProps {
  label: string;
  value: string;
  unit?: string;
  source?: string;
  onChange?: (newValue: string) => void;
}

export function AssumptionInput({ label, value, unit, source, onChange }: AssumptionInputProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSubmit = () => {
    onChange?.(editValue);
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-50/50 border border-amber-200/50 text-sm">
      <span className="text-text-secondary font-medium">{label}:</span>
      {editing ? (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-24 px-1.5 py-0.5 border border-border-default rounded text-sm bg-white"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            aria-label={`Edit ${label}`}
          />
          {unit && <span className="text-text-tertiary text-xs">{unit}</span>}
          <button
            onClick={handleSubmit}
            className="p-0.5 text-success hover:text-success/80"
            aria-label="Confirm change"
          >
            <Check size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-text-primary font-medium">
            {value}{unit && <span className="text-text-tertiary text-xs ml-0.5">{unit}</span>}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="p-0.5 text-text-tertiary hover:text-cei-blue-light"
            aria-label={`Edit ${label}`}
          >
            <Pencil size={12} />
          </button>
          {source && (
            <span className="text-xs text-text-tertiary">(from {source})</span>
          )}
        </div>
      )}
    </div>
  );
}
