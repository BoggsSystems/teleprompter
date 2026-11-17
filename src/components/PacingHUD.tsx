import React from 'react';
import { Play, Pause, RotateCcw, Settings, List, Edit3, Maximize, Minimize } from 'lucide-react';
import { PrompterState, OpticalConfig, ScriptToken } from '../types';
import { formatTime, calculateEstimatedSeconds, calculatePacingDelta } from '../utils/pacingCalculator';

interface PacingHUDProps {
  prompterState: PrompterState;
  elapsedSeconds: number;
  totalWordCount: number;
  currentWordIndex: number;
  config: OpticalConfig;
  cuePauseRemaining: number;
  activeCue: ScriptToken | null;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (wpm: number) => void;
  onToggleSettings: () => void;
  onToggleNav: () => void;
  onSwitchToEditor: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  activeSectionTitle?: string;
}

export const PacingHUD: React.FC<PacingHUDProps> = ({
  prompterState,
  elapsedSeconds,
  totalWordCount,
  currentWordIndex,
  config,
  cuePauseRemaining,
  activeCue,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onToggleSettings,
  onToggleNav,
  onSwitchToEditor,
  onToggleFullscreen,
  isFullscreen,
  activeSectionTitle,
}) => {
  const estimatedTotalSec = calculateEstimatedSeconds(totalWordCount, config.targetWpm);
  const remainingSec = Math.max(0, estimatedTotalSec - elapsedSeconds);
  const { label: pacingLabel, secondsDelta } = calculatePacingDelta(currentWordIndex, elapsedSeconds, config.targetWpm);
  const progressPercent = totalWordCount > 0 ? Math.min(100, Math.round((currentWordIndex / totalWordCount) * 100)) : 0;

  // Decide whether HUD floats at top or bottom based on the anchor:
  // If reading anchor is at top (14%), place HUD at bottom to never block the eye line!
  // If reading anchor is at bottom (80%), place HUD at top.
  const isHudAtBottom = config.anchorPosition === 'top';

  return (
    <div
      className={`fixed inset-x-0 z-30 transition-all duration-300 pointer-events-none ${
        isHudAtBottom ? 'bottom-3' : 'top-3'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-2">
        {/* Cue Pause Banner Alert */}
        {prompterState === 'CUE_PAUSED' && (
          <div className="pointer-events-auto flex items-center gap-3 px-5 py-2 rounded-full bg-amber-500/20 border border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.4)] backdrop-blur-md animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-300 font-mono text-sm font-semibold tracking-wide uppercase">
              {activeCue?.cueLabel || 'Stage Pause'}
            </span>
            <span className="text-white font-mono text-base font-bold bg-amber-600/40 px-2.5 py-0.5 rounded-md border border-amber-400/40">
              {cuePauseRemaining}s
            </span>
            <span className="text-amber-200/80 text-xs">Press Space to skip</span>
          </div>
        )}

        {/* Main Floating Glass HUD Bar */}
        <div className="pointer-events-auto w-full bg-neutral-900/90 hover:bg-neutral-900/95 transition-all duration-200 border border-neutral-700/60 rounded-2xl shadow-2xl backdrop-blur-xl px-4 py-2.5 flex items-center justify-between gap-4">
          
          {/* Left: Play/Pause, Reset & State Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePlay}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                prompterState === 'SCROLLING'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-600'
              }`}
              title="Spacebar to Play/Pause"
            >
              {prompterState === 'SCROLLING' ? (
                <>
                  <Pause size={16} className="fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={16} className="fill-current" />
                  <span>Scroll</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="p-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border border-neutral-700/50"
              title="Reset to Top (Key: R)"
            >
              <RotateCcw size={16} />
            </button>

            {/* Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-950/60 border border-neutral-800 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  prompterState === 'SCROLLING'
                    ? 'bg-emerald-500 animate-pulse'
                    : prompterState === 'CUE_PAUSED'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-neutral-500'
                }`}
              />
              <span className="text-neutral-300 uppercase tracking-wider text-[11px]">
                {prompterState === 'SCROLLING'
                  ? 'LIVE'
                  : prompterState === 'CUE_PAUSED'
                  ? 'PAUSE'
                  : 'READY'}
              </span>
            </div>
          </div>

          {/* Center: Timing Metrics & Section Title */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <span className="text-neutral-500 text-[10px] uppercase">Elapsed</span>
                <span className="text-white font-bold text-sm tracking-wider">{formatTime(elapsedSeconds)}</span>
              </div>
              <span className="text-neutral-600">/</span>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="text-neutral-500 text-[10px] uppercase">Rem</span>
                <span className="tracking-wider">{formatTime(remainingSec)}</span>
              </div>
              <span className="text-neutral-600 hidden md:inline">|</span>
              <span
                className={`hidden md:inline font-bold px-1.5 py-0.5 rounded text-[10px] ${
                  secondsDelta > 10
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : secondsDelta < -10
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {pacingLabel}
              </span>
            </div>

            {/* Progress Bar & Section label */}
            <div className="w-full flex items-center gap-2 mt-1">
              <div className="w-36 sm:w-56 h-1.5 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700/50">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              {activeSectionTitle && (
                <span className="text-[10px] text-neutral-400 truncate max-w-[120px] sm:max-w-[180px]">
                  {activeSectionTitle}
                </span>
              )}
            </div>
          </div>

          {/* Right: WPM Speed Control & Actions */}
          <div className="flex items-center gap-1.5">
            {/* Speed Gauge */}
            <div className="flex items-center bg-neutral-950/70 border border-neutral-800 rounded-xl px-2 py-1">
              <button
                onClick={() => onSpeedChange(Math.max(60, config.targetWpm - 5))}
                className="text-neutral-400 hover:text-white px-1 text-xs font-bold"
                title="Decrease Speed (Down Arrow)"
              >
                -
              </button>
              <span className="text-amber-400 font-mono text-xs font-bold mx-1.5 min-w-[54px] text-center">
                {config.targetWpm} <span className="text-[10px] text-neutral-500 font-normal">WPM</span>
              </span>
              <button
                onClick={() => onSpeedChange(Math.min(300, config.targetWpm + 5))}
                className="text-neutral-400 hover:text-white px-1 text-xs font-bold"
                title="Increase Speed (Up Arrow)"
              >
                +
              </button>
            </div>

            {/* Table of Contents Button */}
            <button
              onClick={onToggleNav}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border border-neutral-700/50"
              title="Table of Contents / Jump Sections"
            >
              <List size={16} />
            </button>

            {/* Settings Overlay Button */}
            <button
              onClick={onToggleSettings}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border border-neutral-700/50"
              title="Prompter Ergonomics & Settings"
            >
              <Settings size={16} />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={onToggleFullscreen}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all border border-neutral-700/50 hidden sm:flex"
              title="Toggle Fullscreen (Key: F)"
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>

            {/* Switch to Editor Button */}
            <button
              onClick={onSwitchToEditor}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-all border border-neutral-700/50"
              title="Edit Script (Key: E or Esc)"
            >
              <Edit3 size={14} />
              <span className="hidden md:inline">Edit</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
