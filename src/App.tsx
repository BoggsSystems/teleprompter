import { useState, useMemo, useCallback } from 'react';
import { useScriptStorage } from './hooks/useScriptStorage';
import { parseScript } from './utils/scriptParser';
import { EditorView } from './components/EditorView';
import { PrompterView } from './components/PrompterView';

export function App() {
  const { script, setScript, config, updateConfig, resetScriptToDefault } = useScriptStorage();
  const [isPrompterView, setIsPrompterView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse script tokens & sections
  const { tokens, sections, totalWordCount } = useMemo(() => {
    return parseScript(script);
  }, [script]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  }, []);



  return (
    <div className="w-full h-full min-h-screen bg-black">
      {isPrompterView ? (
        <PrompterView
          tokens={tokens}
          sections={sections}
          totalWordCount={totalWordCount}
          config={config}
          onUpdateConfig={updateConfig}
          onSwitchToEditor={() => setIsPrompterView(false)}
          onToggleFullscreen={handleToggleFullscreen}
          isFullscreen={isFullscreen}
        />
      ) : (
        <EditorView
          script={script}
          onChangeScript={setScript}
          totalWordCount={totalWordCount}
          sections={sections}
          config={config}
          onUpdateConfig={updateConfig}
          onStartPrompter={() => setIsPrompterView(true)}
          onResetDefault={resetScriptToDefault}
        />
      )}
    </div>
  );
}

export default App;
