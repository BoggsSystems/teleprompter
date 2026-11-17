import React from 'react';
import { OpticalConfig } from '../types';

interface ReadingAnchorGuideProps {
  config: OpticalConfig;
}

export const ReadingAnchorGuide: React.FC<ReadingAnchorGuideProps> = ({ config }) => {
  const topPercent = config.anchorTopPercent;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* Optional Top Vignette */}
      {config.showVignette && (
        <div
          className="absolute inset-x-0 top-0 transition-all duration-300 pointer-events-none"
          style={{
            height: `${Math.max(0, topPercent - 5)}%`,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
          }}
        />
      )}

      {/* Focus Anchor Line */}
      {config.showGuideLine && (
        <div
          className="absolute inset-x-0 flex items-center justify-center transition-all duration-300"
          style={{ top: `${topPercent}%`, transform: 'translateY(-50%)' }}
        >
          {/* Subtle horizontal marker centered over the text column */}
          <div
            className="h-[2px] transition-all duration-300 rounded-full"
            style={{
              width: `${config.columnWidthPx + 60}px`,
              background: 'linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.45) 20%, rgba(245, 158, 11, 0.8) 50%, rgba(245, 158, 11, 0.45) 80%, transparent 100%)',
              boxShadow: '0 0 12px rgba(245, 158, 11, 0.35)',
            }}
          />
          {/* Arrow / Eye pointer indicators on sides */}
          <div
            className="absolute flex items-center justify-between pointer-events-none"
            style={{ width: `${config.columnWidthPx + 100}px` }}
          >
            <span className="text-amber-500/70 text-xs font-mono font-bold tracking-widest">▶</span>
            <span className="text-amber-500/70 text-xs font-mono font-bold tracking-widest">◀</span>
          </div>
        </div>
      )}

      {/* Optional Bottom Vignette */}
      {config.showVignette && (
        <div
          className="absolute inset-x-0 bottom-0 transition-all duration-300 pointer-events-none"
          style={{
            height: `${Math.max(0, 100 - (topPercent + 25))}%`,
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 70%, transparent 100%)',
          }}
        />
      )}
    </div>
  );
};
