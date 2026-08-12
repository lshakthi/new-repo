import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { mockTaskGroups } from '../mocks/tasks';
import { ViewMode } from '../design-system/tokens';
import {
  FlaskConical, Target, Atom, Map, Eye, Package, Zap,
  ArrowRight, Clock, ShieldAlert, Search
} from 'lucide-react';

const groupIcons: Record<string, typeof FlaskConical> = {
  'understand-science': FlaskConical,
  'validate-target': Target,
  'look-at-molecules': Atom,
  'map-path-to-market': Map,
  'watch-landscape': Eye,
  'produce-deliverable': Package,
  'cross-domain': Zap,
};

export function TaskLauncherPage() {
  const { mode } = useApp();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Sort task groups by mode priority
  const sortedGroups = [...mockTaskGroups].sort((a, b) => {
    const priorityKey = mode === ViewMode.SCIENCE ? 'sciencePriority' : 'businessPriority';
    return a[priorityKey] - b[priorityKey];
  });

  // Filter by search
  const filteredGroups = searchQuery
    ? sortedGroups.map(group => ({
        ...group,
        tasks: group.tasks.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.examples.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter(group => group.tasks.length > 0)
    : sortedGroups;

  const handleTaskSelect = (taskId: string) => {
    navigate('/research', { state: { taskId } });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">What do you want to accomplish?</h1>
        <p className="text-sm text-text-secondary mt-1">
          Pick a task below, or describe what you need in your own words.
        </p>
      </div>

      {/* Search / Just ask */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Describe what you need, or search tasks..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 transition-all shadow-sm"
          aria-label="Search tasks or describe your need"
        />
        {searchQuery && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => navigate('/research', { state: { query: searchQuery } })}
              className="px-3 py-1 rounded-lg bg-cei-blue text-white text-xs font-medium hover:bg-cei-navy transition-colors"
            >
              Just ask
            </button>
          </div>
        )}
      </div>

      {/* Routing hint */}
      {searchQuery && (
        <div className="mb-6 px-4 py-2.5 bg-cei-blue/5 border border-cei-blue/10 rounded-lg">
          <p className="text-sm text-cei-blue">
            <span className="font-medium">I think this is a </span>
            {searchQuery.toLowerCase().includes('variant') || searchQuery.toLowerCase().includes('mutation')
              ? 'variant interpretation question. I will query ClinVar, gnomAD, literature, and functional predictors.'
              : searchQuery.toLowerCase().includes('fda') || searchQuery.toLowerCase().includes('regulatory')
              ? 'regulatory planning question. I will check FDA pathways, predicate devices, and relevant guidance.'
              : searchQuery.toLowerCase().includes('target')
              ? 'target validation question. I will pull disease association, pathway context, and literature evidence.'
              : 'scientific research question. I will search literature and relevant databases.'
            }
          </p>
        </div>
      )}

      {/* Task groups */}
      <div className="space-y-4">
        {filteredGroups.map((group) => {
          const Icon = groupIcons[group.id] || FlaskConical;
          const isExpanded = expandedGroup === group.id;

          return (
            <div key={group.id} className="border border-border-subtle rounded-xl bg-surface-elevated overflow-hidden">
              {/* Group header */}
              <button
                onClick={() => setExpandedGroup(isExpanded ? null : group.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-surface-panel/50 transition-colors text-left"
                aria-expanded={isExpanded}
              >
                <div className="w-10 h-10 rounded-xl bg-cei-blue/5 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-cei-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-text-primary">{group.title}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">{group.description}</p>
                </div>
                <span className="text-xs text-text-tertiary flex-shrink-0">{group.tasks.length} tasks</span>
                <ArrowRight size={14} className={`text-text-tertiary transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>

              {/* Tasks */}
              {isExpanded && (
                <div className="border-t border-border-subtle px-5 py-3 space-y-2 bg-surface-panel/30">
                  {group.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskSelect(task.id)}
                      className="w-full text-left px-4 py-3 rounded-lg border border-border-subtle bg-surface-elevated hover:border-cei-blue-light/40 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary group-hover:text-cei-blue transition-colors">
                            {task.title}
                          </p>
                          <p className="text-xs text-text-secondary mt-0.5">{task.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {task.estimatedTime && (
                              <span className="flex items-center gap-1 text-[10px] text-text-tertiary">
                                <Clock size={10} /> {task.estimatedTime}
                              </span>
                            )}
                            {task.requiresApproval && (
                              <span className="flex items-center gap-1 text-[10px] text-review-required">
                                <ShieldAlert size={10} /> Requires approval
                              </span>
                            )}
                          </div>
                          {/* Example queries */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {task.examples.slice(0, 2).map((ex, i) => (
                              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-surface-panel border border-border-subtle text-text-tertiary">
                                "{ex.length > 50 ? ex.slice(0, 50) + '...' : ex}"
                              </span>
                            ))}
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-text-tertiary group-hover:text-cei-blue-light mt-1 flex-shrink-0 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Verticals */}
      <div className="mt-8 border-t border-border-subtle pt-6">
        <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">Start from your area</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { title: 'Diagnostics', desc: 'Assay validation, genetic testing, pathogen detection' },
            { title: 'Medical Devices', desc: 'FDA pathways, ISO readiness, predicate search' },
            { title: 'Therapeutics', desc: 'Target validation, compound discovery, IND readiness' },
          ].map((v) => (
            <button
              key={v.title}
              onClick={() => navigate('/research', { state: { vertical: v.title.toLowerCase() } })}
              className="text-left px-4 py-3 rounded-lg border border-border-subtle bg-surface-elevated hover:border-cei-blue-light/30 hover:shadow-sm transition-all"
            >
              <p className="text-sm font-medium text-text-primary">{v.title}</p>
              <p className="text-xs text-text-secondary mt-0.5">{v.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
