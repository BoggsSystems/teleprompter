import React from 'react';
import { X, Eye, Sliders, Type, Palette, ArrowUpDown } from 'lucide-react';
import { OpticalConfig, AnchorPosition, ColorTheme, TextAlignment } from '../types';

interface ControlOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  config: OpticalConfig;
  onUpdateConfig: (updates: Partial<OpticalConfig>) => void;
}

export const ControlOverlay: React.FC<ControlOverlayProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sliders size={20} className="text-amber-500" />
            <div>
              <h2 className="text-white font-bold text-lg">Optical & Display Ergonomics</h2>
              <p className="text-neutral-400 text-xs">Tune reading line and contrast to match your iPhone placement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-6">

          {/* 1. Camera Placement & Reading Anchor Mode */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <ArrowUpDown size={14} className="text-amber-500" />
              Camera Placement & Reading Anchor
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateConfig({ anchorPosition: 'top' as AnchorPosition })}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  config.anchorPosition === 'top'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-neutral-800/40 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-sm text-amber-300">Top Bezel (Recommended)</div>
                <div className="text-xs text-neutral-400 mt-1">
                  iPhone on books/mount above monitor. Reading line pinned at top 14%.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateConfig({ anchorPosition: 'bottom' as AnchorPosition })}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  config.anchorPosition === 'bottom'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-neutral-800/40 border-neutral-700 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="font-semibold text-sm text-amber-300">Bottom Bezel</div>
                <div className="text-xs text-neutral-400 mt-1">
                  iPhone on desk stand in front of monitor. Reading line pinned at bottom 80%.
                </div>
              </button>
            </div>
          </div>

          {/* 2. Column Width (Crucial for preventing eye movement) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Eye size={14} className="text-amber-500" />
                Column Width (Prevents Side-to-Side Eye Darting)
              </label>
              <span className="font-mono text-amber-400 font-bold">{config.columnWidthPx}px</span>
            </div>
            <input
              type="range"
              min={340}
              max={680}
              step={10}
              value={config.columnWidthPx}
              onChange={(e) => onUpdateConfig({ columnWidthPx: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-neutral-500">
              <span>Narrow (340px - Best for eye contact)</span>
              <span>Wide (680px)</span>
            </div>
          </div>

          {/* 3. Typography: Font Size & Line Height */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Type size={14} className="text-amber-500" />
                  Font Size
                </label>
                <span className="font-mono text-amber-400 font-bold">{config.fontSizePx}px</span>
              </div>
              <input
                type="range"
                min={22}
                max={56}
                step={2}
                value={config.fontSizePx}
                onChange={(e) => onUpdateConfig({ fontSizePx: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold uppercase tracking-wider text-neutral-400">Line Spacing</label>
                <span className="font-mono text-amber-400 font-bold">{config.lineHeight}x</span>
              </div>
              <input
                type="range"
                min={1.4}
                max={2.3}
                step={0.1}
                value={config.lineHeight}
                onChange={(e) => onUpdateConfig({ lineHeight: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
              />
            </div>
          </div>

          {/* 4. Color Theme (Anti-Glare) */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Palette size={14} className="text-amber-500" />
              Theme & Contrast (Dark eliminates monitor reflection on face)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'oled-black', name: 'OLED Black', desc: '#000000 White', bg: 'bg-black text-white' },
                { id: 'charcoal', name: 'Charcoal', desc: '#121212 Soft', bg: 'bg-[#121212] text-neutral-200' },
                { id: 'high-vis-yellow', name: 'High-Vis Yellow', desc: 'Black + Yellow', bg: 'bg-black text-yellow-300' },
                { id: 'warm-amber', name: 'Warm Amber', desc: 'Black + Amber', bg: 'bg-black text-amber-400' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onUpdateConfig({ theme: t.id as ColorTheme })}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    config.theme === t.id
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-neutral-800 hover:border-neutral-700'
                  } ${t.bg}`}
                >
                  <div className="font-bold text-xs">{t.name}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Visual Guides & Cue Behavior */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-800">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 cursor-pointer hover:bg-neutral-800/70">
              <input
                type="checkbox"
                checked={config.showGuideLine}
                onChange={(e) => onUpdateConfig({ showGuideLine: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs text-neutral-300 font-medium">Guide Line</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 cursor-pointer hover:bg-neutral-800/70">
              <input
                type="checkbox"
                checked={config.showVignette}
                onChange={(e) => onUpdateConfig({ showVignette: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs text-neutral-300 font-medium">Soft Vignette</span>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 cursor-pointer hover:bg-neutral-800/70">
              <input
                type="checkbox"
                checked={config.autoPauseOnCues}
                onChange={(e) => onUpdateConfig({ autoPauseOnCues: e.target.checked })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span className="text-xs text-neutral-300 font-medium">Auto-Pause on [Cues]</span>
            </label>
          </div>

          {/* Text Alignment */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/40 border border-neutral-800 text-xs">
            <span className="text-neutral-300 font-medium">Text Alignment</span>
            <div className="flex gap-1.5">
              {(['center', 'left'] as TextAlignment[]).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => onUpdateConfig({ textAlignment: align })}
                  className={`px-3 py-1 rounded-lg uppercase font-semibold text-[11px] transition-all ${
                    config.textAlignment === align
                      ? 'bg-amber-500 text-black font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {align}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
          <span className="text-xs text-neutral-500">Settings save automatically to local storage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
