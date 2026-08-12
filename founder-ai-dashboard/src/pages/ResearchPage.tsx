import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { mockResearchConversation } from '../mocks/research';
import {
  CitationChip, ConfidenceBadge, ProvenanceTrail, UncertaintyBlock,
  SourceConflictView, ReviewGate
} from '../design-system';
import { Send, Sparkles, User, Bot, ArrowRight } from 'lucide-react';

export function ResearchPage() {
  const { setEvidencePanelOpen, setActiveSourceId } = useApp();
  const [inputValue, setInputValue] = useState('');
  const messages = mockResearchConversation;

  const handleCitationClick = (id: string) => {
    setActiveSourceId(id);
    setEvidencePanelOpen(true);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, would send message to backend
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Session header */}
      <div className="border-b border-border-subtle px-6 py-3 bg-surface-elevated flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-sm font-semibold text-text-primary">TP53 R175H target validation</h1>
          <p className="text-xs text-text-tertiary mt-0.5">Started Aug 12, 2026 · Science mode</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-medium text-text-secondary hover:bg-surface-panel transition-colors">
            Export session
          </button>
          <button className="px-3 py-1.5 rounded-lg border border-border-subtle text-xs font-medium text-text-secondary hover:bg-surface-panel transition-colors">
            New task from results
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === 'user' && (
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="w-7 h-7 rounded-full bg-cei-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={14} className="text-cei-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-text-primary leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )}

            {msg.role === 'system' && (
              <div className="flex items-start gap-3 max-w-3xl">
                <div className="w-7 h-7 rounded-full bg-surface-panel flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={14} className="text-text-tertiary" />
                </div>
                <div className="px-3 py-2 rounded-lg bg-surface-panel border border-border-subtle">
                  <p className="text-xs text-text-secondary italic">{msg.content}</p>
                </div>
              </div>
            )}

            {msg.role === 'assistant' && msg.sections && (
              <div className="flex items-start gap-3 max-w-4xl">
                <div className="w-7 h-7 rounded-full bg-cei-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  {/* Sections */}
                  {msg.sections.map((section) => (
                    <div key={section.id} className="border border-border-subtle rounded-lg p-4 bg-surface-elevated">
                      {/* Section header */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold text-text-primary">{section.title}</h3>
                        <ConfidenceBadge level={section.confidence} size="sm" />
                      </div>

                      {/* Content */}
                      <p className="text-sm text-text-primary leading-relaxed">{section.content}</p>

                      {/* Citations */}
                      {section.citations && section.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border-subtle">
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

                      {/* Uncertainties */}
                      {section.uncertainties && section.uncertainties.map((u, i) => (
                        <UncertaintyBlock key={i} what={u.what} resolution={u.resolution} />
                      ))}

                      {/* Conflict view */}
                      {section.conflict && (
                        <SourceConflictView
                          topic={section.conflict.topic}
                          positions={section.conflict.positions as [any, any]}
                          onSourceClick={handleCitationClick}
                        />
                      )}
                    </div>
                  ))}

                  {/* Review gate for clinical/therapeutic content */}
                  <ReviewGate
                    reviewerType="oncologist or clinical geneticist"
                    reason="This assessment touches therapeutic targeting of a clinically significant variant. The evidence summary is decision support for research prioritization, not a clinical recommendation."
                  />

                  {/* Provenance */}
                  {msg.provenance && (
                    <ProvenanceTrail
                      steps={msg.provenance}
                      totalDuration={msg.totalDuration}
                    />
                  )}

                  {/* Follow-ups */}
                  {msg.followUps && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-text-tertiary mb-2">Continue exploring</p>
                      <div className="flex flex-wrap gap-2">
                        {msg.followUps.map((fu, i) => (
                          <button
                            key={i}
                            onClick={() => setInputValue(fu)}
                            className="text-xs px-3 py-1.5 rounded-lg border border-border-subtle bg-surface-elevated text-text-secondary hover:border-cei-blue-light/40 hover:text-cei-blue transition-all flex items-center gap-1.5"
                          >
                            {fu}
                            <ArrowRight size={10} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="border-t border-border-subtle bg-surface-elevated px-6 py-4 flex-shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask a follow-up question, or paste new data..."
              className="w-full pl-4 pr-12 py-3 rounded-xl border border-border-subtle bg-surface-panel text-sm placeholder:text-text-tertiary focus:border-cei-blue-light focus:ring-2 focus:ring-cei-blue-light/20 transition-all"
              aria-label="Ask a follow-up question"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-cei-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-cei-navy transition-colors"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="text-[10px] text-text-tertiary mt-1.5 text-center">
            Results are decision support, not professional advice. All claims link to their sources.
          </p>
        </form>
      </div>
    </div>
  );
}
