import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useProductTour } from '../components/tour/ProductTour';
import { mockTaskGroups } from '../mocks/tasks';
import { taskConversations, defaultConversation, generateAnswer, starterPrompts } from '../mocks/conversations';
import type { TaskConversation, ChatMessage } from '../mocks/conversations';
import { ViewMode } from '../design-system/tokens';
import { ChatResponse } from '../components/ChatResponse';
import { NcbiToolCard } from '../components/NcbiToolCard';
import { NcbiToolMenu } from '../components/NcbiToolMenu';
import { detectNcbiTool, getNcbiTool } from '../mocks/ncbiTools';
import type { NcbiToolId } from '../mocks/ncbiTools';
import {
  FlaskConical, Target, Atom, Map, Eye, Package, Zap,
  ArrowRight, Clock, ShieldAlert, Search, Send, User, Bot,
  ArrowLeft, Plus, Dna
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
  const { mode } = useApp();
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
  // Extra messages added by the user during the session (the Q&A thread)
  const [extraMessages, setExtraMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const tourIsGuidingTask = tourIsOpen && ['task-query', 'task-group', 'task-select'].includes(tourStage);

  // Get conversation for the selected task
  const conversation: TaskConversation = activeTask
    ? (taskConversations[activeTask] || defaultConversation)
    : defaultConversation;
  const messages = [...conversation.messages, ...extraMessages];

  // NCBI tool discovery: "/" opens a tool menu; free text shows a live intent hint.
  const slashActive = inputValue.startsWith('/');
  const slashFilter = slashActive ? inputValue.slice(1) : '';
  const detectedTool = slashActive ? null : detectNcbiTool(inputValue);

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
    setExtraMessages([]);
    setInputValue('');
    setActiveTask(taskId);
  };

  const handleBack = () => {
    setActiveTask(null);
    setExtraMessages([]);
    setInputValue('');
  };

  // Append a user turn + an interactive NCBI tool card as the assistant turn.
  const launchNcbiTool = (toolId: NcbiToolId, userText: string, input: string, autoRun: boolean) => {
    if (!activeTask) setActiveTask('new-chat');
    const stamp = Date.now();
    const userMsg: ChatMessage = { id: `user-${stamp}`, role: 'user', content: userText };
    const toolMsg: ChatMessage = {
      id: `ncbi-${stamp}`,
      role: 'assistant',
      content: '',
      ncbiTool: { toolId, input, autoRun },
    };
    setExtraMessages((prev) => [...prev, userMsg, toolMsg]);
    setInputValue('');
  };

  const askQuestion = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    // NCBI intent detection: organism, gene/keyword, or a raw nucleotide string.
    const ncbiToolId = detectNcbiTool(trimmed);
    if (ncbiToolId) {
      launchNcbiTool(ncbiToolId, trimmed, trimmed, true);
      return;
    }

    // If no task is active yet, open a fresh chat
    if (!activeTask) setActiveTask('new-chat');

    const turnIndex = extraMessages.length;
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setExtraMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    // Simulate backend latency, then append the answer (shaped by mode)
    const answerMode = mode === ViewMode.BUSINESS ? 'business' : 'science';
    window.setTimeout(() => {
      const answer = generateAnswer(trimmed, turnIndex, answerMode);
      setExtraMessages((prev) => [...prev, answer]);
      setIsThinking(false);
    }, 900);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    askQuestion(inputValue);
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
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-cei-blue/10 flex items-center justify-center mb-4">
                <Bot size={24} className="text-cei-blue" />
              </div>
              <h2 className="text-base font-semibold text-text-primary">Start a new chat</h2>
              <p className="text-sm text-text-secondary mt-1.5">
                {mode === ViewMode.BUSINESS
                  ? 'Ask a business or commercialization question in plain language. Founder AI answers with regulatory, market, and diligence framing.'
                  : 'Ask a scientific question in plain language. Founder AI answers with computational and mechanistic depth.'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {(mode === ViewMode.BUSINESS ? starterPrompts.business : starterPrompts.science).map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => askQuestion(ex)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border-subtle text-text-secondary hover:border-cei-blue-light/40 hover:text-cei-blue transition-all"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
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

              {/* Assistant NCBI tool card */}
              {msg.role === 'assistant' && msg.ncbiTool && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cei-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="flex-1 space-y-2 max-w-3xl">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      I mapped that to the <span className="font-medium text-text-primary">{getNcbiTool(msg.ncbiTool.toolId as NcbiToolId).name}</span> tool. Review the input, then run it.
                    </p>
                    <NcbiToolCard
                      toolId={msg.ncbiTool.toolId as NcbiToolId}
                      initialValue={msg.ncbiTool.input}
                      autoRun={msg.ncbiTool.autoRun}
                    />
                  </div>
                </div>
              )}

              {/* Assistant response */}
              {msg.role === 'assistant' && msg.sections && (
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cei-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <ChatResponse
                      summary={msg.id.startsWith('ans-') ? '' : conversation.summary}
                      sections={msg.sections}
                      provenance={msg.provenance}
                      totalDuration={msg.totalDuration}
                      followUps={msg.followUps}
                      onFollowUpClick={(text) => askQuestion(text)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cei-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-panel">
                <span className="w-1.5 h-1.5 rounded-full bg-cei-blue/60 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-cei-blue/60 animate-pulse [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-cei-blue/60 animate-pulse [animation-delay:300ms]" />
                <span className="text-xs text-text-tertiary ml-1">Searching sources...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle bg-surface-elevated px-6 py-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            {/* Slash-menu for NCBI tool discovery */}
            {slashActive && (
              <div className="mb-2">
                <NcbiToolMenu
                  filter={slashFilter}
                  onSelect={(toolId) => launchNcbiTool(toolId, `Use the ${getNcbiTool(toolId).name} tool`, '', false)}
                />
              </div>
            )}
            <form onSubmit={handleSend}>
              <div className="relative">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a follow-up, or type / for NCBI tools..."
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
            {/* Live intent hint */}
            <div className="mt-1.5 px-1">
              {detectedTool ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-cei-blue">
                  <Dna size={11} /> Will run the {getNcbiTool(detectedTool).name} tool
                </span>
              ) : (
                <span className="text-[11px] text-text-tertiary">
                  Type <span className="font-mono text-text-secondary">/</span> to browse NCBI tools, or ask about an organism, gene, or paste a sequence.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── TASK PICKER (default view) ──────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div data-tour="task-overview" className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">What do you want to accomplish?</h1>
          <p className="text-sm text-text-secondary mt-1">
            A task is a guided workflow that gives Founder AI a clear goal, relevant tools, and an expected output.
          </p>
        </div>
        <button
          onClick={() => handleTaskSelect('new-chat')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cei-blue text-white text-sm font-medium hover:bg-cei-navy transition-colors flex-shrink-0 shadow-sm"
        >
          <Plus size={16} />
          New chat
        </button>
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
