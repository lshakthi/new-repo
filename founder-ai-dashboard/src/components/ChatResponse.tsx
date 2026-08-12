import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { CitationChip, ConfidenceBadge, ProvenanceTrail } from '../design-system';
import type { ProvenanceStep } from '../design-system';
import { useApp } from '../context/AppContext';
import type { ChatSection } from '../mocks/conversations';

interface ChatResponseProps {
  summary: string;
  sections: ChatSection[];
  provenance?: ProvenanceStep[];
  totalDuration?: string;
  followUps?: string[];
  onFollowUpClick?: (text: string) => void;
}

// Chart colors
const COLORS = ['#1B4F72', '#2980B9', '#0F766E', '#D97706', '#7C3AED', '#DC2626', '#059669', '#6B7280'];

export function ChatResponse({ summary, sections, provenance, totalDuration, followUps, onFollowUpClick }: ChatResponseProps) {
  const { setEvidencePanelOpen, setActiveSourceId } = useApp();

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Summary */}
      <p className="text-sm text-text-primary leading-relaxed">{summary}</p>

      {/* Sections: all expanded, with full detail */}
      {sections.map((section) => (
        <div key={section.id} className="rounded-lg border border-border-subtle overflow-hidden bg-surface-elevated">
          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle bg-surface-panel/30">
            <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
            <ConfidenceBadge level={section.confidence} size="sm" />
          </div>

          {/* Section content */}
          <div className="px-4 py-3 space-y-3">
            <p className="text-sm text-text-primary leading-relaxed">{section.content}</p>

            {/* Table data */}
            {section.tableData && (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs border border-border-subtle rounded-md overflow-hidden">
                  <thead>
                    <tr className="bg-surface-panel">
                      {section.tableData.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-semibold text-text-secondary border-b border-border-subtle">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.tableData.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-surface-panel/30'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-text-primary border-b border-border-subtle">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bar chart */}
            {section.chartData && section.chartType === 'bar' && (
              <div className="mt-3 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={section.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="value" fill="#2980B9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Pie chart */}
            {section.chartData && section.chartType === 'pie' && (
              <div className="mt-3 h-48 w-full flex items-center">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={section.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label labelLine={false} fontSize={10}>
                        {section.chartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 ml-4 space-y-1">
                  {section.chartData.map((entry, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-text-secondary">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key metrics row */}
            {section.metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                {section.metrics.map((m, i) => (
                  <div key={i} className="px-3 py-2 bg-surface-panel rounded-md text-center">
                    <p className="text-lg font-semibold text-text-primary">{m.value}</p>
                    <p className="text-[10px] text-text-tertiary mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Uncertainties */}
            {section.uncertainties && section.uncertainties.map((u, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-md bg-evidence-missing-bg border border-evidence-missing/15 mt-2">
                <span className="text-xs text-text-tertiary leading-relaxed">
                  <span className="font-medium text-text-secondary">Open question:</span> {u.what}
                  <br /><span className="font-medium text-text-secondary">To resolve:</span> {u.resolution}
                </span>
              </div>
            ))}

            {/* Conflict */}
            {section.conflict && (
              <div className="mt-2 p-3 rounded-md bg-evidence-conflict-bg/50 border border-evidence-conflict/10">
                <p className="text-xs font-semibold text-evidence-conflict mb-2">
                  Experts disagree: {section.conflict.topic}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {section.conflict.positions.map((pos, i) => (
                    <div key={i} className="bg-white/60 rounded p-2">
                      <p className="text-xs font-medium text-text-primary mb-1">{pos.position}</p>
                      <p className="text-xs text-text-secondary">{pos.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations */}
            {section.citations && section.citations.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-subtle mt-3">
                {section.citations.map((cit) => (
                  <CitationChip
                    key={cit.id}
                    id={cit.id}
                    label={cit.label}
                    sourceType={cit.sourceType}
                    onClick={handleCitationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Review notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-review-required-bg/50 border border-review-required/15">
        <span className="text-xs text-review-required font-medium">Note:</span>
        <span className="text-xs text-text-secondary">
          This is decision support. A qualified reviewer should check before acting on it.
        </span>
      </div>

      {/* Provenance */}
      {provenance && (
        <ProvenanceTrail steps={provenance} totalDuration={totalDuration} />
      )}

      {/* Follow-ups */}
      {followUps && followUps.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {followUps.map((fu, i) => (
            <button
              key={i}
              onClick={() => onFollowUpClick?.(fu)}
              className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:border-cei-blue-light/40 hover:text-cei-blue transition-all"
            >
              {fu}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
