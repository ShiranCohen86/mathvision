import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { solveProblem, getPracticeProblem } from '../lib/api';
import { BoardSolve } from '../features/solve/BoardSolve';
import { MathKeypad } from '../features/solve/MathKeypad';
import { MathBlock } from '../components/MathBlock';
import pageStyles from './pages.module.scss';
import styles from '../features/solve/solve.module.scss';

const EXAMPLES = ['x^2 - 5x + 6 = 0', '2x + 3 = 7', 'x^2 - 9 = 0', 'x^2 + 2x + 1 = 0'];

export function CapturePage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [solution, setSolution] = useState(null);
  const [progressDelta, setProgressDelta] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [boardOpen, setBoardOpen] = useState(false);
  const inputRef = useRef(null);

  function insertAtCursor(text) {
    const el = inputRef.current;
    if (!el) {
      setInput((v) => v + text);
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    setInput(input.slice(0, start) + text + input.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + text.length;
      el.setSelectionRange(pos, pos);
    });
  }

  function backspaceAtCursor() {
    const el = inputRef.current;
    if (!el) {
      setInput((v) => v.slice(0, -1));
      return;
    }
    const start = el.selectionStart ?? input.length;
    const end = el.selectionEnd ?? input.length;
    if (start === end && start > 0) {
      setInput(input.slice(0, start - 1) + input.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      });
    } else if (start !== end) {
      setInput(input.slice(0, start) + input.slice(end));
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start);
      });
    }
  }

  async function handleSolve(problem) {
    const p = (problem ?? input).trim();
    if (!p) return;
    setInput(p);
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await solveProblem(p);
      setSolution(res.solution);
      setProgressDelta(res.progress ?? null);
      setStatus('done');
      setBoardOpen(true);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
    }
  }

  async function handlePractice() {
    try {
      const { problem } = await getPracticeProblem();
      handleSolve(problem);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`container ${pageStyles.page}`}>
      <header className={pageStyles.header}>
        <h1 className={pageStyles.title}>{t('capture.title')}</h1>
        <p className={pageStyles.subtitle}>{t('solve.prompt')}</p>
      </header>

      <div className={styles.inputRow}>
        <input
          ref={inputRef}
          className={styles.input}
          dir="ltr"
          value={input}
          placeholder="x^2 - 5x + 6 = 0"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSolve();
          }}
          aria-label={t('solve.prompt')}
        />
        <button
          type="button"
          className={styles.solveBtn}
          onClick={() => handleSolve()}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? t('solve.solving') : t('solve.action')}
        </button>
      </div>

      <MathKeypad
        onInsert={insertAtCursor}
        onBackspace={backspaceAtCursor}
        backspaceLabel={t('solve.backspace')}
      />

      <div className={styles.examples}>
        <button type="button" className={styles.practiceChip} onClick={handlePractice}>
          🎲 {t('solve.practice')}
        </button>
        <span className={styles.examplesLabel}>{t('solve.examples')}</span>
        {EXAMPLES.map((ex) => (
          <button
            type="button"
            key={ex}
            className={styles.chip}
            dir="ltr"
            onClick={() => handleSolve(ex)}
          >
            {ex}
          </button>
        ))}
      </div>

      {status === 'error' && <div className={styles.error}>{errorMsg}</div>}

      {status === 'done' && solution && !boardOpen && (
        <div className={styles.resultCard}>
          <div className={styles.resultAnswer}>
            <MathBlock latex={solution.finalAnswer} display={false} />
          </div>
          <button type="button" className={styles.solveBtn} onClick={() => setBoardOpen(true)}>
            {t('solve.watch')}
          </button>
        </div>
      )}

      <p className={styles.hint}>{t('solve.hint')}</p>

      {boardOpen && solution && (
        <BoardSolve
          solution={solution}
          progressDelta={progressDelta}
          onClose={() => setBoardOpen(false)}
        />
      )}
    </div>
  );
}
