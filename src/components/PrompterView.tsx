import React, { useRef, useMemo } from 'react';
import { OpticalConfig, ScriptToken, SectionHeader } from '../types';
import { useScrollEngine } from '../hooks/useScrollEngine';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { ReadingAnchorGuide } from './ReadingAnchorGuide';
import { PacingHUD } from './PacingHUD';
import { SectionNav } from './SectionNav';
import { ControlOverlay } from './ControlOverlay';

interface PrompterViewProps {
  tokens: ScriptToken[];
  sections: SectionHeader[];
  totalWordCount: number;
  config: OpticalConfig;
  onUpdateConfig: (updates: Partial<OpticalConfig>) => void;
  onSwitchToEditor: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
}

export const PrompterView: React.FC<PrompterViewProps> = ({
  tokens,
  sections,
  totalWordCount,
  config,
  onUpdateConfig,
  onSwitchToEditor,
  onToggleFullscreen,
  isFullscreen,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const {
    prompterState,
    scrollOffset,
    elapsedSeconds,
    currentWordIndex,
    cuePauseRemaining,
    activeCue,
    togglePlayPause,
    resetToStart,
    seekToTokenId,
    handleWheel,
  } = useScrollEngine({
    tokens,
    config,
    containerRef,
    contentRef,
  });

  const handleNextSection = () => {
    const nextSec = sections.find(s => s.wordIndex > currentWordIndex + 5);
    if (nextSec) {
      const token = tokens[nextSec.tokenIndex];
      if (token) seekToTokenId(token.id);
    }
  };

  const handlePrevSection = () => {
    const reversed = [...sections].reverse();
    const prevSec = reversed.find(s => s.wordIndex < currentWordIndex - 5);
    if (prevSec) {
      const token = tokens[prevSec.tokenIndex];
      if (token) seekToTokenId(token.id);
    }
  };

  useKeyboardControls({
    isPrompterView: true,
    onTogglePlayPause: togglePlayPause,
    onSpeedChange: (newWpm) => onUpdateConfig({ targetWpm: newWpm }),
    onReset: resetToStart,
    onNextSection: handleNextSection,
    onPrevSection: handlePrevSection,
    onToggleAnchor: () => {
      onUpdateConfig({ anchorPosition: config.anchorPosition === 'top' ? 'bottom' : 'top' });
    },
    onToggleFullscreen,
    onToggleView: onSwitchToEditor,
    config,
  });

  // Theme styling mapping
  const themeClasses = useMemo(() => {
    switch (config.theme) {
      case 'charcoal':
        return {
          bg: 'bg-[#121212]',
          text: 'text-neutral-100',
          heading: 'text-white border-neutral-700',
        };
      case 'high-vis-yellow':
        return {
          bg: 'bg-black',
          text: 'text-yellow-300',
          heading: 'text-yellow-400 border-yellow-700/60',
        };
      case 'warm-amber':
        return {
          bg: 'bg-black',
          text: 'text-amber-300',
          heading: 'text-amber-400 border-amber-700/60',
        };
      case 'oled-black':
      default:
        return {
          bg: 'bg-black',
          text: 'text-neutral-100',
          heading: 'text-white border-neutral-800',
        };
    }
  }, [config.theme]);

  // Find active section title
  const activeSectionTitle = useMemo(() => {
    let currentTitle = sections[0]?.title;
    for (const sec of sections) {
      if (currentWordIndex >= sec.wordIndex) {
        currentTitle = sec.title;
      } else {
        break;
      }
    }
    return currentTitle;
  }, [sections, currentWordIndex]);

  // Dynamic padding to allow the first line to sit exactly on the reading anchor at scroll=0,
  // and the last line to scroll past the anchor.
  const anchorYPercent = config.anchorTopPercent;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      className={`relative w-screen h-screen overflow-hidden select-none cursor-default transition-colors duration-300 ${themeClasses.bg}`}
    >
      {/* Visual Reading Anchor Line & Vignette */}
      <ReadingAnchorGuide config={config} />

      {/* Floating Pacing & Control HUD */}
      <PacingHUD
        prompterState={prompterState}
        elapsedSeconds={elapsedSeconds}
        totalWordCount={totalWordCount}
        currentWordIndex={currentWordIndex}
        config={config}
        cuePauseRemaining={cuePauseRemaining}
        activeCue={activeCue}
        onTogglePlay={togglePlayPause}
        onReset={resetToStart}
        onSpeedChange={(wpm) => onUpdateConfig({ targetWpm: wpm })}
        onToggleSettings={() => setIsSettingsOpen(true)}
        onToggleNav={() => setIsNavOpen(true)}
        onSwitchToEditor={onSwitchToEditor}
        onToggleFullscreen={onToggleFullscreen}
        isFullscreen={isFullscreen}
        activeSectionTitle={activeSectionTitle}
      />

      {/* Table of Contents Modal */}
      <SectionNav
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
        sections={sections}
        currentWordIndex={currentWordIndex}
        onSelectSection={(sec) => {
          const targetToken = tokens[sec.tokenIndex];
          if (targetToken) seekToTokenId(targetToken.id);
        }}
      />

      {/* Optical Settings Overlay */}
      <ControlOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={onUpdateConfig}
      />

      {/* Main Scrolling Text Track */}
      <div
        className="w-full h-full flex justify-center pointer-events-none"
        style={{
          transform: `translate3d(0, -${scrollOffset}px, 0)`,
          willChange: 'transform',
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${config.columnWidthPx}px`,
            fontSize: `${config.fontSizePx}px`,
            lineHeight: config.lineHeight,
            textAlign: config.textAlignment,
            paddingTop: `${anchorYPercent}vh`,
            paddingBottom: '85vh',
          }}
          className={`transition-all duration-150 font-display ${themeClasses.text}`}
        >
          {tokens.map((token) => {
            if (token.type === 'break') {
              return token.content === '\n\n' ? (
                <div key={token.id} className="h-6 w-full" />
              ) : (
                <span key={token.id}> </span>
              );
            }

            if (token.type === 'heading') {
              return (
                <div
                  key={token.id}
                  data-token-id={token.id}
                  className={`mt-10 mb-4 pb-2 border-b-2 font-bold tracking-tight text-[1.25em] ${themeClasses.heading}`}
                >
                  {token.content}
                </div>
              );
            }

            if (token.type === 'cue') {
              const cueType = token.cueType;

              if (cueType === 'PAUSE') {
                return (
                  <span
                    key={token.id}
                    data-token-id={token.id}
                    data-cue-type="PAUSE"
                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-1.5 rounded-full text-[0.55em] font-mono font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm align-middle"
                  >
                    ⏱️ PAUSE {token.cueDurationSec}s
                  </span>
                );
              }

              if (cueType === 'SLIDE') {
                return (
                  <span
                    key={token.id}
                    data-token-id={token.id}
                    data-cue-type="SLIDE"
                    className="inline-flex items-center gap-1.5 px-3 py-1 my-1 mx-1.5 rounded-lg text-[0.55em] font-mono font-bold tracking-wider uppercase bg-blue-500/20 text-blue-300 border border-blue-500/50 shadow-sm align-middle"
                  >
                    📽️ {token.cueLabel || 'NEXT SLIDE'}
                  </span>
                );
              }

              if (cueType === 'QUESTION') {
                return (
                  <div
                    key={token.id}
                    data-token-id={token.id}
                    data-cue-type="QUESTION"
                    className="my-3 p-3 rounded-2xl bg-purple-950/40 text-purple-200 border border-purple-500/40 text-[0.7em] font-medium italic shadow-inner"
                  >
                    💬 Ask Students: {token.cueLabel}
                  </div>
                );
              }

              if (cueType === 'EMPHASIZE') {
                return (
                  <span
                    key={token.id}
                    data-token-id={token.id}
                    data-cue-type="EMPHASIZE"
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 my-1 mx-1 rounded-md text-[0.55em] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40 align-middle"
                  >
                    ⚡ EMPHASIZE
                  </span>
                );
              }

              return (
                <span
                  key={token.id}
                  data-token-id={token.id}
                  data-cue-type="NOTE"
                  className="inline-block px-2 py-0.5 my-1 mx-1 rounded text-[0.6em] font-mono bg-neutral-800 text-neutral-400 border border-neutral-700 align-middle"
                >
                  [{token.cueLabel}]
                </span>
              );
            }

            // Standard Word
            return (
              <span
                key={token.id}
                data-token-id={token.id}
                data-word-index={token.wordIndex}
                className="inline transition-colors"
              >
                {token.content}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
