import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders a LaTeX string with KaTeX. Math is forced LTR (via `.ltr-math`) so it
 * stays correct inside an RTL (Hebrew) layout.
 */
export function MathBlock({ latex, display = true }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex ?? '', {
        displayMode: display,
        throwOnError: false,
        output: 'htmlAndMathml',
      });
    } catch {
      return latex ?? '';
    }
  }, [latex, display]);

  return (
    <span
      className="ltr-math"
      // KaTeX output is sanitized; throwOnError:false renders errors inline.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
