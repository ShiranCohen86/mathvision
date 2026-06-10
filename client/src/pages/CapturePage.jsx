import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { solveProblem } from '../lib/api';
import { SolutionView } from '../features/solve/SolutionView';
import pageStyles from './pages.module.scss';
import styles from '../features/solve/solve.module.scss';

const EXAMPLES = ['x^2 - 5x + 6 = 0', '2x + 3 = 7', 'x^2 - 9 = 0', 'x^2 + 2x + 1 = 0'];

export function CapturePage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [state, setState] = useState({ status: 'idle' });

  async function handleSolve(problem) {
    const p = (problem ?? input).trim();
    if (!p) return;
    setInput(p);
    setState({ status: 'loading' });
    try {
      const res = await solveProblem(p);
      setState({ status: 'done', solution: res.solution });
    } catch (err) {
      setState({ status: 'error', message: err.message });
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
          disabled={state.status === 'loading'}
        >
          {state.status === 'loading' ? t('solve.solving') : t('solve.action')}
        </button>
      </div>

      <div className={styles.examples}>
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

      {state.status === 'error' && <div className={styles.error}>{state.message}</div>}
      {state.status === 'done' && <SolutionView solution={state.solution} />}

      <p className={styles.hint}>{t('solve.hint')}</p>
    </div>
  );
}
