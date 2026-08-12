import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProductTour } from '../components/tour/ProductTour';
import { mockTaskGroups } from '../mocks/tasks';
import { taskConversations, defaultConversation } from '../mocks/conversations';
import type { TaskConversation } from '../mocks/conversations';
import { ViewMode } from '../design-system/tokens';
import { CitationChip, ConfidenceBadge, ProvenanceTrail } from '../design-system';
import {
  FlaskConical, Target, Atom, Map, Eye, Package, Zap,
  ArrowRight, Clock, ShieldAlert, Search, Send, User, Bot,
  ChevronDown, ChevronRight, ArrowLeft
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

const scienceTaskIds = new Set([
  'research-question', 'check-sequence', 'find-public-data', 'target-assessment',
  'variant-interpretation', 'structure-prediction', 'compound-discovery', 'scientific-documents',
]);

const businessTaskIds = new Set([
  'regulatory-planning', 'clinical-landscape', 'patent-fto', 'competitor-monitoring',
  'investor-materials', 'end-to-end-pipeline',
]);

export function TaskLauncherPage() {
  const { mode, setEvidencePanelOpen, setActiveSourceId } = useApp();
  const { reportTourEvent, isOpen: tourIsOpen, stage: tourStage } = useProductTour();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const sessionTaskIds: Record<string, string> = {
    'session-1': 'target-assessment',
    'session-2': 'regulatory-planning',
    'session-3': 'variant-interpretation',
    'session-4': 'compound-discovery',
  };
  const routeState = location.state as { sessionId?: string; taskId?: string } | null;
  const initialTask = routeState?.taskId
    ?? (routeState?.sessionId ? sessionTaskIds[routeState.sessionId] : undefined)
    ?? null;
  const [activeTask, setActiveTask] = useState<string | null>(initialTask);
  const [inputValue, setInputValue] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const tourIsGuidingTask = tourIsOpen && ['task-query', 'task-group', 'task-select'].includes(tourStage);

  // Get conversation for the selected task
  const conversation: TaskConversation = activeTask
    ? (taskConversations[activeTask] || defaultConversation)
    : defaultConversation;
  const messages = conversation.messages;

  const activeTaskIds = mode === ViewMode.SCIENCE ? scienceTaskIds : businessTaskIds;
  const visibleGroups = mockTaskGroups
    .map(group => ({ ...group, tasks: group.tasks.filter(task => activeTaskIds.has(task.id)) }))
    .filter(group => group.tasks.length > 0);

  const filteredGroups = searchQuery
    ? visibleGroups.map(group => ({
        ...group,
        tasks: group.tasks.filter(task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.examples.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      })).filter(group => group.tasks.length > 0)
    : visibleGroups;

  useEffect(() => {
    if (searchQuery.trim().length < 3 || filteredGroups.length === 0) return;
    const timer = window.setTimeout(() => {
      reportTourEvent({ type: 'TASK_QUERY_ENTERED', query: searchQuery });
    }, 650);
    return () => window.clearTimeout(timer);
  }, [filteredGroups.length, reportTourEvent, searchQuery]);

  const handleTaskSelect = (taskId: string) => {
    reportTourEvent({ type: 'TASK_SELECTED', taskId });
    setActiveTask(taskId);
  };

  const handleBack = () => {
    setActiveTask(null);
  };

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setActiveTask('custom-query');
      setInputValue('');
    }
  };

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  // ─── ACTIVE TASK: Show inline chat ───────────────────────────
  if (activeTask) {
    return (
      <div className="h-full flex flex-col">
        {/* Back button + session info */}
        <div className="border-b border-border-subtle px-6 py-2.5 bg-surface-elevated flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-cei-blue transition-colors"
          >
            <ArrowLeft size={14} />
            Back to tasks
          </button>
          <div className="h-4 w-px bg-border-subtle" />
          <p className="text-sm font-medium text-text-primary">{conversation.title}</p>
          <button className="ml-auto text-xs text-text-tertiary hover:text-text-secondary transition-colors">
            Export
          </button>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* User message */}
              {msg.role === 'user' && (
                <div className="flex items-start gap-3 max-w-2xl">
                  <div className="w-6 h-6 rounded-full bg-cei-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-cei-blue" />
                  </div>
                  <p className="text-sm text-text-primary leading-relaxed">{msg.content}</p>
                </div>
              )}

              {/* Routing message */}
              {msg.role === 'system' && (
                <div className="ml-9 px-3 py-1.5 rounded-md bg-surface-panel inline-block">
                  <p className="text-xs text-text-tertiary">{msg.content}</p>
                </div>
              )}

              {/* Assistant response */}
              {msg.role === 'assistant' && msg.sections && (
                <div className="flex items-start gap-3 max-w-3xl">
                  <div className="w-6 h-6 rounded-full bg-cei-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Plain summary */}
                    <p className="text-sm text-text-primary leading-relaxed">
                      {conversation.summary}
                    </p>

                    {/* Collapsible sections */}
                    {msg.sections.map((section) => {
                      const isExpanded = expandedSections.has(section.id);
                      return (
                        <div key={section.id} className="rounded-lg border border-border-subtle overflow-hidden">
                          <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-surface-panel/50 transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown size={14} className="text-text-tertiary flex-shrink-0" />
                              : <ChevronRight size={14} className="text-text-tertiary flex-shrink-0" />
                            }
                            <span className="text-sm font-medium text-text-primary flex-1">{section.title}</span>
                            <ConfidenceBadge level={section.confidence} size="sm" />
                          </button>

                          {isExpanded && (
                            <div className="px-4 pb-3 pt-1 border-t border-border-subtle bg-surface-panel/20">
                              <p className="text-sm text-text-secondary leading-relaxed">{section.content}</p>

                              {section.citations && section.citations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
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

                              {section.uncertainties && section.uncertainties.map((u, i) => (
                                <p key={i} className="text-xs text-text-tertiary mt-2 italic">
                                  Open question: {u.what} To resolve: {u.resolution}
                                </p>
                              ))}

                              {section.conflict && (
                                <div className="mt-2 p-2.5 rounded-md bg-evidence-conflict-bg/50 border border-evidence-conflict/10">
                                  <p className="text-xs font-medium text-evidence-conflict mb-1">
                                    Experts disagree: {section.conflict.topic}
                                  </p>
                                  {section.conflict.positions.map((pos, i) => (
                                    <p key={i} className="text-xs text-text-secondary mt-1">
                                      <span className="font-medium">{pos.position}:</span> {pos.summary}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Review notice */}
                    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-review-required-bg/50 border border-review-required/15">
                      <span className="text-xs text-review-required font-medium">Note:</span>
                      <span className="text-xs text-text-secondary">
                        This is decision support. A qualified reviewer should check before acting on it.
                      </span>
                    </div>

                    {/* Provenance */}
                    {msg.provenance && (
                      <ProvenanceTrail steps={msg.provenance} totalDuration={msg.totalDuration} />
                    )}

                    {/* Follow-ups */}
                    {msg.followUps && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.followUps.map((fu, i) => (
                          <button
                            key={i}
                            onClick={() => setInputValue(fu)}
                            className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:border-cei-blue-light/40 hover:text-cei-blue transition-all"
                          >
                            {fu}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle bg-surface-elevated px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a follow-up question..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-border-subtle bg-surface-panel text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 transition-all"
                aria-label="Ask a follow-up"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cei-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cei-navy transition-colors"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── TASK PICKER (default view) ──────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div data-tour="task-overview" className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">What do you want to accomplish?</h1>
        <p className="text-sm text-text-secondary mt-1">
          A task is a guided workflow that gives Founder AI a clear goal, relevant tools, and an expected output.
        </p>
      </div>

      {/* Search / Just ask */}
      <div className="relative mb-8">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          data-tour="task-query"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Describe what you need, or search tasks..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-surface-elevated text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 transition-all shadow-sm"
          aria-label="Search tasks or describe your need"
        />
        {searchQuery && !tourIsGuidingTask && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={() => handleTaskSelect('custom-query')}
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
        {filteredGroups.map((group, groupIndex) => {
          const Icon = groupIcons[group.id] || FlaskConical;
          const isExpanded = expandedGroup === group.id;

          return (
            <div key={group.id} className="border border-border-subtle rounded-xl bg-surface-elevated overflow-hidden">
              {/* Group header */}
              <button
                data-tour={groupIndex === 0 ? 'task-group' : undefined}
                onClick={() => {
                  if (!isExpanded) reportTourEvent({ type: 'TASK_GROUP_EXPANDED', groupId: group.id });
                  setExpandedGroup(isExpanded ? null : group.id);
                }}
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
                  {group.tasks.map((task, taskIndex) => (
                    <button
                      key={task.id}
                      data-tour={groupIndex === 0 && taskIndex === 0 ? 'task-card' : undefined}
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
              onClick={() => handleTaskSelect('vertical-' + v.title.toLowerCase())}
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
