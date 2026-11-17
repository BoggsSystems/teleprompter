import React from 'react';
import { X, ChevronRight, Hash } from 'lucide-react';
import { SectionHeader } from '../types';

interface SectionNavProps {
  isOpen: boolean;
  onClose: () => void;
  sections: SectionHeader[];
  currentWordIndex: number;
  onSelectSection: (section: SectionHeader) => void;
}

export const SectionNav: React.FC<SectionNavProps> = ({
  isOpen,
  onClose,
  sections,
  currentWordIndex,
  onSelectSection,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash size={18} className="text-amber-500" />
            <h2 className="text-white font-semibold text-base">Lecture Sections & Jump Points</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section List */}
        <div className="overflow-y-auto p-3 space-y-1.5 divide-y divide-neutral-800/50">
          {sections.length === 0 ? (
            <div className="text-neutral-500 text-center py-8 text-sm">
              No Markdown headings found. Add `#` or `##` headings to your script.
            </div>
          ) : (
            sections.map((section, idx) => {
              const isPastOrCurrent = currentWordIndex >= section.wordIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => {
                    onSelectSection(section);
                    onClose();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between transition-all group ${
                    isPastOrCurrent
                      ? 'bg-neutral-800/40 hover:bg-neutral-800 text-white'
                      : 'hover:bg-neutral-800/60 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-400">
                      § {idx + 1}
                    </span>
                    <span className="font-medium text-sm text-neutral-200 group-hover:text-amber-300 transition-colors">
                      {section.title}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-neutral-600 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-500">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono">[</kbd> Prev / <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300 font-mono">]</kbd> Next</span>
          <button
            onClick={onClose}
            className="text-amber-400 hover:underline font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
