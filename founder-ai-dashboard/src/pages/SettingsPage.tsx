import { Circle, CheckCircle2, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-xl font-semibold text-text-primary mb-6">Settings</h1>

      {/* Profile */}
      <section className="border border-border-subtle rounded-lg p-5 bg-surface-elevated mb-4">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Profile</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-xs text-text-tertiary">Name</label>
            <p className="text-text-primary font-medium">Dr. Sarah Chen</p>
          </div>
          <div>
            <label className="text-xs text-text-tertiary">Organization</label>
            <p className="text-text-primary font-medium">NovaDx Therapeutics</p>
          </div>
          <div>
            <label className="text-xs text-text-tertiary">Role</label>
            <p className="text-text-primary font-medium">Founder and CEO</p>
          </div>
          <div>
            <label className="text-xs text-text-tertiary">Vertical</label>
            <p className="text-text-primary font-medium">Therapeutics</p>
          </div>
        </div>
      </section>

      {/* AI Providers */}
      <section className="border border-border-subtle rounded-lg p-5 bg-surface-elevated mb-4">
        <h2 className="text-sm font-semibold text-text-primary mb-4">AI providers</h2>
        <div className="space-y-3">
          {[
            { name: 'AWS Bedrock (Claude)', status: 'connected', detail: 'Primary inference provider' },
            { name: 'Anthropic (direct)', status: 'available', detail: 'Backup provider' },
            { name: 'OpenAI', status: 'not-configured', detail: 'Optional, for specific models' },
          ].map((p) => (
            <div key={p.name} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {p.status === 'connected' && <CheckCircle2 size={16} className="text-success" />}
                {p.status === 'available' && <Circle size={16} className="text-text-tertiary" />}
                {p.status === 'not-configured' && <AlertCircle size={16} className="text-text-tertiary" />}
                <div>
                  <p className="text-sm font-medium text-text-primary">{p.name}</p>
                  <p className="text-xs text-text-secondary">{p.detail}</p>
                </div>
              </div>
              <button className="text-xs text-cei-blue-light hover:text-cei-blue font-medium">
                {p.status === 'connected' ? 'Configure' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Data sources */}
      <section className="border border-border-subtle rounded-lg p-5 bg-surface-elevated mb-4">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Data source connections</h2>
        <div className="space-y-2">
          {[
            { name: 'PubMed / NCBI E-utilities', status: 'healthy' },
            { name: 'ClinVar', status: 'healthy' },
            { name: 'gnomAD', status: 'healthy' },
            { name: 'ClinicalTrials.gov', status: 'healthy' },
            { name: 'ChEMBL', status: 'healthy' },
            { name: 'Open Targets', status: 'healthy' },
            { name: 'Ensembl REST API', status: 'healthy' },
            { name: 'STRING', status: 'degraded' },
            { name: 'PatentsView', status: 'degraded' },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-text-primary">{s.name}</span>
              <span className={`flex items-center gap-1 text-xs ${s.status === 'healthy' ? 'text-success' : 'text-evidence-moderate'}`}>
                <Circle size={6} className={s.status === 'healthy' ? 'fill-success' : 'fill-evidence-moderate'} />
                {s.status === 'healthy' ? 'Connected' : 'Slow response'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Confidentiality */}
      <section className="border border-border-subtle rounded-lg p-5 bg-surface-elevated">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Data handling and confidentiality</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Default confidentiality level for new sessions</span>
            <select className="text-xs border border-border-default rounded-md px-2 py-1 bg-white">
              <option>Internal only</option>
              <option>Shareable with partners</option>
              <option>Public</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Require review before external export</span>
            <input type="checkbox" defaultChecked className="accent-cei-blue" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Log all data access events</span>
            <input type="checkbox" defaultChecked className="accent-cei-blue" />
          </div>
        </div>
      </section>

      {/* Sample notice */}
      <div className="mt-6 px-4 py-2.5 bg-amber-50/50 border border-amber-200/40 rounded-lg">
        <p className="text-xs text-amber-700">
          <span className="font-semibold">Sample data for demonstration.</span> Settings shown here are illustrative. In production, these control real provider connections and data handling policies.
        </p>
      </div>
    </div>
  );
}
