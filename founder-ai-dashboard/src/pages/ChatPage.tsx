import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockResearchConversation } from '../mocks/research';
import { mockTaskGroups } from '../mocks/tasks';
import { ViewMode } from '../design-system/tokens';
import { CitationChip, ConfidenceBadge, ProvenanceTrail } from '../design-system';
import { Send, User, Bot, ChevronDown, ChevronRight } from 'lucide-react';

export function ChatPage() {
  const { mode, setEvidencePanelOpen, setActiveSourceId } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [hasStarted, setHasStarted] = useState(true); // set to false for empty state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const messages = mockResearchConversation;

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setHasStarted(true);
      setInputValue('');
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInputValue(query);
  };

  const toggleSection = (id: string) => {
    const next = new Set(expandedSections);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedSections(next);
  };

  // Sort task groups by mode
  const sortedGroups = [...mockTaskGroups].sort((a, b) => {
    const key = mode === ViewMode.SCIENCE ? 'sciencePriority' : 'businessPriority';
    return a[key] - b[key];
  });

  // Empty state: show task suggestions
  if (!hasStarted) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-xl font-semibold text-text-primary">What can I help you with?</h1>
              <p className="text-sm text-text-secondary mt-2">
                Ask any scientific or business question, or pick a starting point below.
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="grid grid-cols-1 gap-2 mb-6">
              {sortedGroups.slice(0, 4).map((group) => (
                <div key={group.id}>
                  <p className="text-xs font-medium text-text-tertiary mb-1.5">{group.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {group.tasks.slice(0, 2).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSuggestionClick(task.examples[0])}
                        className="text-xs px-3 py-2 rounded-lg border border-border-subtle bg-surface-elevated text-text-secondary hover:border-cei-blue-light/40 hover:text-cei-blue transition-all text-left"
                      >
                        {task.examples[0].length > 60 ? task.examples[0].slice(0, 60) + '...' : task.examples[0]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-border-subtle bg-surface-elevated px-6 py-4 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question or describe what you need..."
                className="w-full pl-4 pr-12 py-3 rounded-xl border border-border-subtle bg-surface-panel text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 transition-all"
                aria-label="Ask a question"
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

  // Active conversation
  return (
    <div className="h-full flex flex-col">
      {/* Minimal session header */}
      <div className="border-b border-border-subtle px-6 py-2.5 bg-surface-elevated flex items-center justify-between flex-shrink-0">
        <p className="text-sm font-medium text-text-primary">TP53 R175H target validation</p>
        <button className="text-xs text-text-tertiary hover:text-text-secondary transition-colors">
          Export
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
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

            {/* System routing message */}
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
                  {/* Summary lead-in */}
                  <p className="text-sm text-text-primary leading-relaxed">
                    Here is what I found about TP53 R175H as a therapeutic target. The variant is well-characterized as pathogenic with strong evidence, but whether it can be effectively targeted by small molecules remains debated.
                  </p>

                  {/* Sections as expandable cards */}
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

                            {/* Citations, compact */}
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

                            {/* Uncertainty inline */}
                            {section.uncertainties && section.uncertainties.map((u, i) => (
                              <p key={i} className="text-xs text-text-tertiary mt-2 italic">
                                Open question: {u.what} To resolve: {u.resolution}
                              </p>
                            ))}

                            {/* Conflict note */}
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

                  {/* Review notice, less heavy */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-review-required-bg/50 border border-review-required/15">
                    <span className="text-xs text-review-required font-medium">Note:</span>
                    <span className="text-xs text-text-secondary">
                      This is decision support. A qualified reviewer should check before acting on it.
                    </span>
                  </div>

                  {/* Provenance, collapsed */}
                  {msg.provenance && (
                    <ProvenanceTrail
                      steps={msg.provenance}
                      totalDuration={msg.totalDuration}
                    />
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
