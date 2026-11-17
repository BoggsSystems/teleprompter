import { useState, useEffect } from 'react';
import { OpticalConfig } from '../types';
import { DEFAULT_SCRIPT } from '../sampleScript';

const SCRIPT_STORAGE_KEY = 'proteleprompter_script_v1';
const CONFIG_STORAGE_KEY = 'proteleprompter_config_v1';

export const DEFAULT_OPTICAL_CONFIG: OpticalConfig = {
  anchorPosition: 'top',
  anchorTopPercent: 14,       // 14% from top bezel (right below top iPhone mount)
  columnWidthPx: 440,         // Narrow column to eliminate horizontal eye movement
  fontSizePx: 34,
  lineHeight: 1.7,
  theme: 'oled-black',        // #000000 true black background
  showGuideLine: true,
  showVignette: true,
  textAlignment: 'center',
  targetWpm: 140,
  autoPauseOnCues: false,
};

export function useScriptStorage() {
  const [script, setScript] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SCRIPT_STORAGE_KEY);
      return saved !== null ? saved : DEFAULT_SCRIPT;
    } catch {
      return DEFAULT_SCRIPT;
    }
  });

  const [config, setConfig] = useState<OpticalConfig>(() => {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_OPTICAL_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_OPTICAL_CONFIG;
  });

  // Auto-save script changes
  useEffect(() => {
    try {
      localStorage.setItem(SCRIPT_STORAGE_KEY, script);
    } catch (e) {
      console.error('Failed to save script to localStorage', e);
    }
  }, [script]);

  // Auto-save config changes
  useEffect(() => {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save config to localStorage', e);
    }
  }, [config]);

  const updateConfig = (updates: Partial<OpticalConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...updates };
      // If switching anchor position, update recommended anchorTopPercent
      if (updates.anchorPosition === 'top' && prev.anchorPosition !== 'top') {
        next.anchorTopPercent = 14;
      } else if (updates.anchorPosition === 'bottom' && prev.anchorPosition !== 'bottom') {
        next.anchorTopPercent = 80;
      }
      return next;
    });
  };

  const resetScriptToDefault = () => {
    setScript(DEFAULT_SCRIPT);
  };

  return {
    script,
    setScript,
    config,
    updateConfig,
    resetScriptToDefault,
  };
}
