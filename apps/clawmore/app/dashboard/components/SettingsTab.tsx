import React from 'react';
import {
  Zap,
  Shield,
  Activity,
  Cpu,
  FileText,
  CheckCircle,
} from 'lucide-react';

interface SettingsTabProps {
  isCoevolutionEnabled: boolean;
  onCoevolutionToggle: (enabled: boolean) => void;
  enabledSkills: string[];
  onSkillToggle: (skill: string) => void;
}

const AVAILABLE_SKILLS = [
  {
    id: 'refactor',
    name: 'Refactor Agent',
    description:
      'Autonomous code cleanup, lint fixing, and pattern modernization.',
    icon: Cpu,
    color: 'text-cyber-blue',
  },
  {
    id: 'security',
    name: 'Security Agent',
    description: 'Continuous CVE scanning and automated dependency hardening.',
    icon: Shield,
    color: 'text-emerald-500',
  },
  {
    id: 'cost',
    name: 'Cost Optimizer',
    description:
      'Identifies expensive AWS patterns and migrates to serverless alternatives.',
    icon: Zap,
    color: 'text-amber-500',
  },
  {
    id: 'documentation',
    name: 'Doc Agent',
    description: 'Keeps READMEs and JSDoc in sync with code mutations.',
    icon: FileText,
    color: 'text-cyber-purple',
  },
];

export default function SettingsTab({
  isCoevolutionEnabled,
  onCoevolutionToggle,
  enabledSkills,
  onSkillToggle,
}: SettingsTabProps) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <h2 className="text-2xl font-black italic tracking-tight text-white uppercase mb-2">
            Skill <span className="text-cyber-blue">Marketplace</span>
          </h2>
          <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500">
            Customize your agentic swarm capabilities
          </p>
        </div>
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-2xl">
          <Zap className="w-4 h-4 text-amber-500" />
          <div className="pr-4 border-r border-white/10">
            <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest mb-1">
              Co-evolution Status
            </p>
            <p
              className={`text-xs font-black italic uppercase ${isCoevolutionEnabled ? 'text-emerald-500' : 'text-amber-500'}`}
            >
              {isCoevolutionEnabled ? 'Tax Waiver Active' : 'Standard Pricing'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-2">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isCoevolutionEnabled}
              onChange={(e) => onCoevolutionToggle(e.target.checked)}
            />
            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AVAILABLE_SKILLS.map((skill) => {
          const isEnabled = enabledSkills.includes(skill.id);
          return (
            <div
              key={skill.id}
              onClick={() => onSkillToggle(skill.id)}
              className={`group cursor-pointer p-8 rounded-[28px] border transition-all duration-300 relative overflow-hidden ${
                isEnabled
                  ? 'bg-black/60 border-cyber-blue/30 shadow-[0_0_40px_rgba(0,224,255,0.05)]'
                  : 'bg-white/[0.02] border-white/5 grayscale hover:grayscale-0 hover:border-white/10'
              }`}
            >
              {isEnabled && (
                <div className="absolute top-0 right-0 p-6">
                  <CheckCircle className="w-5 h-5 text-cyber-blue" />
                </div>
              )}

              <div
                className={`w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
              >
                <skill.icon className={`w-6 h-6 ${skill.color}`} />
              </div>

              <h3 className="text-lg font-black italic text-white uppercase tracking-tight mb-3">
                {skill.name}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-mono">
                {skill.description}
              </p>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <span
                  className={`text-[9px] font-mono font-black uppercase tracking-[0.2em] ${isEnabled ? 'text-cyber-blue' : 'text-zinc-600'}`}
                >
                  {isEnabled ? '● Active' : '○ Available'}
                </span>
                {!isEnabled && (
                  <span className="text-[9px] font-mono text-zinc-700 uppercase group-hover:text-cyber-blue transition-colors">
                    Click to install
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-8 rounded-3xl bg-cyber-blue/5 border border-cyber-blue/10 flex flex-col sm:flex-row gap-6 items-center">
        <div className="w-12 h-12 rounded-2xl bg-cyber-blue/10 flex items-center justify-center shrink-0">
          <Activity className="w-6 h-6 text-cyber-blue" />
        </div>
        <div className="flex-grow text-center sm:text-left">
          <h4 className="text-sm font-black italic text-white uppercase mb-1">
            Need a custom agent?
          </h4>
          <p className="text-xs text-zinc-500 font-mono">
            Contact enterprise support to train a custom agent on your specific
            codebase standards.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-cyber-blue transition-colors">
          REQUEST AGENT
        </button>
      </div>
    </div>
  );
}
