import { Dna, GitBranch, ListTree } from 'lucide-react';
import { ncbiTools } from '../mocks/ncbiTools';
import type { NcbiToolId } from '../mocks/ncbiTools';

const toolIcon: Record<NcbiToolId, typeof Dna> = {
  'taxonomy-lineage': ListTree,
  'sequence-search': GitBranch,
  'blast-sequence': Dna,
};

interface NcbiToolMenuProps {
  /** Free-text filter, e.g. what the user typed after "/". */
  filter?: string;
  onSelect: (toolId: NcbiToolId) => void;
}

/**
 * A compact, discoverable menu of the available NCBI tools.
 * Rendered above the chat input (slash-menu style) or as an empty-state helper.
 */
export function NcbiToolMenu({ filter = '', onSelect }: NcbiToolMenuProps) {
  const q = filter.trim().toLowerCase();
  const tools = q
    ? ncbiTools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.question.toLowerCase().includes(q) ||
          t.keywords.some((k) => k.includes(q)),
      )
    : ncbiTools;

  if (tools.length === 0) {
    return (
      <div className="rounded-xl border border-border-subtle bg-surface-elevated px-4 py-3 text-xs text-text-tertiary shadow-sm">
        No NCBI tool matches “{filter}”. Try “taxonomy”, “sequence”, or “blast”.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated shadow-sm overflow-hidden">
      <div className="px-3 py-2 border-b border-border-subtle bg-surface-panel/40">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">NCBI tools</p>
      </div>
      <ul>
        {tools.map((tool) => {
          const Icon = toolIcon[tool.id];
          return (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => onSelect(tool.id)}
                className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-cei-blue/5 transition-colors border-b border-border-subtle last:border-0"
              >
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-cei-blue/10 text-cei-blue shrink-0 mt-0.5">
                  <Icon size={14} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-primary">{tool.name}</p>
                  <p className="text-xs text-text-secondary leading-5">{tool.description}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
