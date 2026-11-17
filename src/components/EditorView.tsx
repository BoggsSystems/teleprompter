import React from 'react';
import { Play, Sparkles, RotateCcw, Clock, Bookmark, HelpCircle } from 'lucide-react';
import { OpticalConfig, SectionHeader } from '../types';
import { formatTime, calculateEstimatedSeconds } from '../utils/pacingCalculator';

interface EditorViewProps {
  script: string;
  onChangeScript: (val: string) => void;
  totalWordCount: number;
  sections: SectionHeader[];
  config: OpticalConfig;
  onUpdateConfig: (updates: Partial<OpticalConfig>) => void;
  onStartPrompter: () => void;
  onResetDefault: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  script,
  onChangeScript,
  totalWordCount,
  sections,
  config,
  onUpdateConfig,
  onStartPrompter,
  onResetDefault,
}) => {
  const estimatedSeconds = calculateEstimatedSeconds(totalWordCount, config.targetWpm);

  const insertCue = (cueSnippet: string) => {
    const textarea = document.getElementById('script-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = script.substring(0, start);
    const after = script.substring(end);

    const updated = `${before}\n\n${cueSnippet}\n\n${after}`;
    onChangeScript(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cueSnippet.length + 4, start + cueSnippet.length + 4);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/70 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-xl shadow-lg shadow-amber-500/10">
            🎙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white font-bold text-lg tracking-tight">ProTeleprompter Studio</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Desktop Live
              </span>
            </div>
            <p className="text-neutral-400 text-xs">
              Optimized for Mac mini, large screen & iPhone camera presentation
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Anchor Mode Display */}
          <button
            onClick={() => onUpdateConfig({ anchorPosition: config.anchorPosition === 'top' ? 'bottom' : 'top' })}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition-all"
            title="Toggle between Top Bezel and Bottom Bezel camera anchor"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Camera: {config.anchorPosition === 'top' ? 'Top Bezel (Above)' : 'Bottom Bezel (Desk)'}</span>
          </button>

          {/* Start Presentation Button */}
          <button
            onClick={onStartPrompter}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Launch Teleprompter (Key: Space or Esc)"
          >
            <Play size={18} className="fill-current" />
            <span>Start Prompter</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Script Editor (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          {/* Cue Quick-Insert Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
            <span className="text-neutral-500 font-medium px-2 flex items-center gap-1">
              <Sparkles size={14} className="text-amber-500" />
              Insert Cue:
            </span>
            <button
              onClick={() => insertCue('[PAUSE 3s]')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-amber-500/20 hover:text-amber-300 text-neutral-300 border border-neutral-700/60 font-mono transition-colors"
            >
              ⏱️ [PAUSE 3s]
            </button>
            <button
              onClick={() => insertCue('[SLIDE: Slide Title]')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-blue-500/20 hover:text-blue-300 text-neutral-300 border border-neutral-700/60 font-mono transition-colors"
            >
              📽️ [SLIDE: Title]
            </button>
            <button
              onClick={() => insertCue('[QUESTION: Question for class]')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-purple-500/20 hover:text-purple-300 text-neutral-300 border border-neutral-700/60 font-mono transition-colors"
            >
              💬 [QUESTION]
            </button>
            <button
              onClick={() => insertCue('[EMPHASIZE]')}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-rose-500/20 hover:text-rose-300 text-neutral-300 border border-neutral-700/60 font-mono transition-colors"
            >
              ⚡ [EMPHASIZE]
            </button>
          </div>

          {/* Text Editor Box */}
          <div className="relative flex-1 bg-neutral-900/60 border border-neutral-800 rounded-3xl p-4 shadow-inner focus-within:border-amber-500/60 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all flex flex-col min-h-[500px]">
            <textarea
              id="script-textarea"
              value={script}
              onChange={(e) => onChangeScript(e.target.value)}
              placeholder="Paste or write your lecture script here... (Supports Markdown headings # and stage cues like [PAUSE 3s])"
              className="w-full flex-1 bg-transparent text-neutral-100 placeholder-neutral-600 font-display text-base leading-relaxed resize-none focus:outline-none p-2"
              rows={22}
            />
            <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
              <span>Auto-saved to local browser storage</span>
              <button
                onClick={onResetDefault}
                className="flex items-center gap-1 text-neutral-400 hover:text-amber-400 transition-colors"
                title="Restore default engineering sample script"
              >
                <RotateCcw size={12} />
                <span>Reset to Sample Lecture</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Statistics, Presets & Instructions (1 col) */}
        <div className="flex flex-col gap-4">
          
          {/* Speech Metrics Card */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-4">
            <h3 className="font-semibold text-sm text-neutral-200 flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              Lecture Timing Estimates
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                <div className="text-[11px] text-neutral-400 uppercase font-medium">Estimated Time</div>
                <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                  {formatTime(estimatedSeconds)}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                <div className="text-[11px] text-neutral-400 uppercase font-medium">Total Words</div>
                <div className="text-xl font-bold font-mono text-white mt-1">
                  {totalWordCount}
                </div>
              </div>
            </div>

            {/* Target WPM Dial */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-400">Target Pace (WPM)</span>
                <span className="font-mono text-amber-400 font-bold">{config.targetWpm} WPM</span>
              </div>
              <input
                type="range"
                min={80}
                max={220}
                step={5}
                value={config.targetWpm}
                onChange={(e) => onUpdateConfig({ targetWpm: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-neutral-500">
                <span>100 (Slow)</span>
                <span>140 (Natural)</span>
                <span>180 (Fast)</span>
              </div>
            </div>
          </div>

          {/* Section Outline Card */}
          <div className="p-5 rounded-3xl bg-neutral-900 border border-neutral-800 space-y-3 flex-1 flex flex-col">
            <h3 className="font-semibold text-sm text-neutral-200 flex items-center gap-2">
              <Bookmark size={16} className="text-amber-500" />
              Identified Sections ({sections.length})
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-1 max-h-56 pr-1 divide-y divide-neutral-800/40">
              {sections.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">
                  Use markdown headings like `## 1. Intro` to create quick jump points.
                </p>
              ) : (
                sections.map((sec, idx) => (
                  <div key={sec.id} className="pt-1.5 text-xs text-neutral-300 flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400">
                      {idx + 1}
                    </span>
                    <span className="truncate">{sec.title}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Keyboard Quick Cheatsheet */}
          <div className="p-4 rounded-3xl bg-neutral-900/50 border border-neutral-800 space-y-2 text-xs">
            <div className="font-semibold text-neutral-300 flex items-center gap-1.5">
              <HelpCircle size={14} className="text-amber-500" />
              Keyboard Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-neutral-400 font-mono">
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">Space</kbd> Play/Pause</div>
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">↑ / ↓</kbd> Speed ±5</div>
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">1 2 3</kbd> Speed Presets</div>
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">[ / ]</kbd> Jump Section</div>
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">R</kbd> Reset Top</div>
              <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-white">Esc</kbd> Prompter/Edit</div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};
