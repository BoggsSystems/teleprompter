import { ScriptToken, SectionHeader } from '../types';

export interface ParsedScript {
  tokens: ScriptToken[];
  sections: SectionHeader[];
  totalWordCount: number;
}

export function parseScript(rawText: string): ParsedScript {
  const lines = rawText.split('\n');
  const tokens: ScriptToken[] = [];
  const sections: SectionHeader[] = [];
  let currentWordIndex = 0;
  let currentSectionIndex = 0;

  // Regex to match stage cues like [PAUSE 3s], [SLIDE 4], [QUESTION: ...], etc.
  const cueRegex = /\[(PAUSE|SLIDE|QUESTION|EMPHASIZE|NOTE)(?:\s*:?\s*([^\]]*))?\]/i;

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      // Paragraph break
      tokens.push({
        id: `break-${lineIdx}`,
        type: 'break',
        content: '\n\n',
      });
      return;
    }

    // Check for Markdown Headings
    if (trimmed.startsWith('#')) {
      const headingText = trimmed.replace(/^#+\s*/, '');
      const section: SectionHeader = {
        id: `sec-${sections.length}`,
        title: headingText,
        tokenIndex: tokens.length,
        wordIndex: currentWordIndex,
      };
      sections.push(section);

      tokens.push({
        id: `head-${tokens.length}`,
        type: 'heading',
        content: headingText,
        sectionIndex: sections.length - 1,
      });
      currentSectionIndex = sections.length - 1;
      return;
    }

    // Tokenize line by cues and words
    let remainingLine = line;

    while (remainingLine.length > 0) {
      const cueMatch = remainingLine.match(cueRegex);

      if (cueMatch && cueMatch.index !== undefined) {
        // Words before the cue
        const beforeText = remainingLine.substring(0, cueMatch.index);
        if (beforeText.trim()) {
          const words = beforeText.split(/(\s+)/);
          words.forEach((chunk) => {
            if (!chunk) return;
            if (/^\s+$/.test(chunk)) {
              tokens.push({
                id: `space-${tokens.length}`,
                type: 'word',
                content: chunk,
              });
            } else {
              tokens.push({
                id: `word-${tokens.length}`,
                type: 'word',
                content: chunk,
                wordIndex: currentWordIndex++,
                sectionIndex: currentSectionIndex,
              });
            }
          });
        }

        // The Cue Token
        const cueTag = cueMatch[1].toUpperCase() as 'PAUSE' | 'SLIDE' | 'QUESTION' | 'EMPHASIZE' | 'NOTE';
        const cueArg = (cueMatch[2] || '').trim();

        let cueDurationSec = 0;
        if (cueTag === 'PAUSE') {
          const numMatch = cueArg.match(/^(\d+(?:\.\d+)?)/);
          cueDurationSec = numMatch ? parseFloat(numMatch[1]) : 3; // default 3s pause
        }

        tokens.push({
          id: `cue-${tokens.length}`,
          type: 'cue',
          content: cueMatch[0],
          cueType: cueTag,
          cueDurationSec,
          cueLabel: cueArg || cueTag,
          sectionIndex: currentSectionIndex,
        });

        remainingLine = remainingLine.substring(cueMatch.index + cueMatch[0].length);
      } else {
        // No more cues, parse remaining words
        const words = remainingLine.split(/(\s+)/);
        words.forEach((chunk) => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) {
            tokens.push({
              id: `space-${tokens.length}`,
              type: 'word',
              content: chunk,
            });
          } else {
            tokens.push({
              id: `word-${tokens.length}`,
              type: 'word',
              content: chunk,
              wordIndex: currentWordIndex++,
              sectionIndex: currentSectionIndex,
            });
          }
        });
        remainingLine = '';
      }
    }

    // Line ending break
    tokens.push({
      id: `break-${lineIdx}-end`,
      type: 'break',
      content: ' ',
    });
  });

  return {
    tokens,
    sections,
    totalWordCount: currentWordIndex,
  };
}
