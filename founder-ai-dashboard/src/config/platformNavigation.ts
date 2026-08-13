export interface PlatformDestination {
  label: string;
  path: string;
  description: string;
  keywords: string[];
}

export const platformDestinations: PlatformDestination[] = [
  { label: 'Home', path: '/', description: 'Dashboard overview, quick actions, and recent chats.', keywords: ['dashboard', 'overview', 'recent'] },
  { label: 'New Task', path: '/tasks', description: 'Start a guided task or continue an evidence-backed conversation.', keywords: ['create', 'science', 'business', 'workflow', 'chat', 'question', 'evidence'] },
  { label: 'History', path: '/history', description: 'Find and reopen previous conversations.', keywords: ['chats', 'sessions', 'recent'] },
  { label: 'Tools', path: '/tools', description: 'Query approved scientific databases using natural language.', keywords: ['api', 'database', 'search', 'pubmed', 'trials', 'chemistry', 'providers', 'codes'] },
  { label: 'Settings', path: '/settings', description: 'Manage providers, data sources, and confidentiality.', keywords: ['configuration', 'providers', 'privacy', 'tour'] },
  { label: 'Target Assessment', path: '/target-assessment', description: 'Review a biological target evidence scorecard.', keywords: ['validation', 'science', 'evidence'] },
  { label: 'Variant Report', path: '/variant-report', description: 'View genetic variant evidence and interpretation.', keywords: ['genetic', 'mutation', 'clinical'] },
  { label: 'Regulatory Brief', path: '/regulatory', description: 'Review regulatory pathway recommendations.', keywords: ['fda', 'business', 'approval'] },
  { label: 'Evidence Pipeline', path: '/pipeline', description: 'Follow a cross-domain evidence workflow.', keywords: ['workflow', 'pipeline', 'decision'] },
];
