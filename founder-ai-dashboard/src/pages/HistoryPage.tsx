import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, FlaskConical, MessageSquare } from 'lucide-react';
import { mockSessions } from '../mocks/sessions';

export function HistoryPage() {
  const navigate = useNavigate();
  const conversations = mockSessions.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div data-tour="history-overview" className="mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Chat history</h1>
        <p className="text-sm text-text-secondary mt-1">Return to recent conversations and continue where you left off.</p>
      </div>
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const ModeIcon = conversation.mode === 'science' ? FlaskConical : Briefcase;
          return (
            <button
              key={conversation.id}
              onClick={() => navigate('/research', { state: { sessionId: conversation.id } })}
              className="w-full text-left p-5 rounded-xl border border-border-subtle bg-surface-elevated hover:border-cei-blue-light/40 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cei-blue/5 flex items-center justify-center flex-shrink-0">
                  <MessageSquare size={18} className="text-cei-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-text-primary group-hover:text-cei-blue transition-colors">{conversation.title}</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-panel text-[10px] font-medium text-text-secondary capitalize"><ModeIcon size={10} />{conversation.mode}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-1 line-clamp-2">{conversation.description}</p>
                  <p className="text-xs text-text-tertiary mt-2">Last message {new Date(conversation.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
                <ArrowRight size={15} className="text-text-tertiary group-hover:text-cei-blue-light mt-1 transition-colors" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
