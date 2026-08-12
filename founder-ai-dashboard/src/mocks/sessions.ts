export interface Session {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'partial';
  createdAt: string;
  updatedAt: string;
  taskType: string;
  mode: 'science' | 'business';
}

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    title: 'TP53 R175H target validation',
    description: 'Assessing TP53 as a therapeutic target with focus on the R175H gain-of-function mutation in solid tumors.',
    status: 'active',
    createdAt: '2026-08-11T14:30:00Z',
    updatedAt: '2026-08-12T09:15:00Z',
    taskType: 'target-validation',
    mode: 'science',
  },
  {
    id: 'session-2',
    title: '510(k) pathway analysis: cfDNA diagnostic',
    description: 'Regulatory pathway triage for a cell-free DNA liquid biopsy device targeting early colorectal cancer detection.',
    status: 'completed',
    createdAt: '2026-08-09T10:00:00Z',
    updatedAt: '2026-08-10T16:45:00Z',
    taskType: 'regulatory-pathway',
    mode: 'business',
  },
  {
    id: 'session-3',
    title: 'BRAF V600E variant evidence report',
    description: 'Complete variant interpretation dossier for investor diligence packet.',
    status: 'completed',
    createdAt: '2026-08-07T11:20:00Z',
    updatedAt: '2026-08-07T15:30:00Z',
    taskType: 'variant-interpretation',
    mode: 'science',
  },
  {
    id: 'session-4',
    title: 'Compound prioritization: IL-6R inhibitors',
    description: 'Ranked shortlist of known IL-6R compounds from ChEMBL with SAR analysis.',
    status: 'partial',
    createdAt: '2026-08-06T09:00:00Z',
    updatedAt: '2026-08-06T12:10:00Z',
    taskType: 'compound-discovery',
    mode: 'science',
  },
];

