import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Briefcase, Stethoscope, Cpu, Pill, ArrowRight, Check } from 'lucide-react';

type Step = 'role' | 'vertical' | 'first-task';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<string | null>(null);
  const [vertical, setVertical] = useState<string | null>(null);

  const roles = [
    { id: 'scientist', label: 'Scientist or CTO', desc: 'I run experiments, analyze data, and validate targets.', icon: FlaskConical },
    { id: 'founder', label: 'Founder or CEO', desc: 'I make business decisions about what to build and how to fund it.', icon: Briefcase },
    { id: 'both', label: 'Both', desc: 'I do the science and run the company.', icon: FlaskConical },
  ];

  const verticals = [
    { id: 'diagnostics', label: 'Diagnostics', desc: 'Genetic tests, liquid biopsy, assay development', icon: Stethoscope },
    { id: 'devices', label: 'Medical Devices', desc: 'Instruments, software as a device, point-of-care', icon: Cpu },
    { id: 'therapeutics', label: 'Therapeutics', desc: 'Small molecules, biologics, gene therapy', icon: Pill },
  ];

  const firstTasks = role === 'scientist' || role === 'both'
    ? [
        { label: 'Research a scientific question', path: '/research' },
        { label: 'Validate a target', path: '/tasks' },
        { label: 'Check a sequence', path: '/tasks' },
      ]
    : [
        { label: 'Explore regulatory pathways', path: '/regulatory' },
        { label: 'Size my market', path: '/tasks' },
        { label: 'Screen patents in my space', path: '/tasks' },
      ];

  return (
    <div className="min-h-screen bg-surface-primary flex items-center justify-center px-6">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-cei-blue flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">CEI</span>
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Founder AI Science Dashboard</h1>
          <p className="text-sm text-text-secondary mt-1">
            Let's set up your workspace. This takes about 30 seconds.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['role', 'vertical', 'first-task'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                s === step ? 'bg-cei-blue' : (
                  ['role', 'vertical', 'first-task'].indexOf(step) > i ? 'bg-success' : 'bg-border-default'
                )
              }`} />
              {i < 2 && <div className="w-8 h-px bg-border-default" />}
            </div>
          ))}
        </div>

        {/* Step 1: Role */}
        {step === 'role' && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary text-center mb-1">How do you work?</h2>
            <p className="text-sm text-text-secondary text-center mb-6">This sets your default view. You can always switch.</p>
            <div className="space-y-3">
              {roles.map((r) => {
                const Icon = r.icon;
                return (
                  <button
                    key={r.id}
                    onClick={() => { setRole(r.id); setStep('vertical'); }}
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                      role === r.id
                        ? 'border-cei-blue bg-cei-blue/5'
                        : 'border-border-subtle bg-surface-elevated hover:border-cei-blue-light/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cei-blue/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-cei-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{r.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{r.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-text-tertiary ml-auto" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Vertical */}
        {step === 'vertical' && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary text-center mb-1">What are you building?</h2>
            <p className="text-sm text-text-secondary text-center mb-6">This helps surface relevant tasks first. All tasks remain available.</p>
            <div className="space-y-3">
              {verticals.map((v) => {
                const Icon = v.icon;
                return (
                  <button
                    key={v.id}
                    onClick={() => { setVertical(v.id); setStep('first-task'); }}
                    className={`w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
                      vertical === v.id
                        ? 'border-cei-blue bg-cei-blue/5'
                        : 'border-border-subtle bg-surface-elevated hover:border-cei-blue-light/40 hover:shadow-sm'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-cei-blue/5 flex items-center justify-center flex-shrink-0">
                      <Icon size={20} className="text-cei-blue" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{v.label}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{v.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-text-tertiary ml-auto" />
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep('role')} className="mt-4 text-xs text-text-tertiary hover:text-text-secondary mx-auto block">
              Back
            </button>
          </div>
        )}

        {/* Step 3: First task */}
        {step === 'first-task' && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary text-center mb-1">What would you like to do first?</h2>
            <p className="text-sm text-text-secondary text-center mb-6">Pick one to jump straight in, or go to the dashboard.</p>
            <div className="space-y-3">
              {firstTasks.map((t) => (
                <button
                  key={t.label}
                  onClick={() => navigate(t.path)}
                  className="w-full text-left flex items-center gap-3 px-5 py-4 rounded-xl border border-border-subtle bg-surface-elevated hover:border-cei-blue-light/40 hover:shadow-sm transition-all"
                >
                  <Check size={16} className="text-cei-blue" />
                  <span className="text-sm font-medium text-text-primary">{t.label}</span>
                  <ArrowRight size={14} className="text-text-tertiary ml-auto" />
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 text-sm text-cei-blue-light hover:text-cei-blue font-medium mx-auto block"
            >
              Skip, take me to the dashboard
            </button>
            <button onClick={() => setStep('vertical')} className="mt-2 text-xs text-text-tertiary hover:text-text-secondary mx-auto block">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
