import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { solveProblem } from '../lib/api';
import { BoardSolve } from '../features/solve/BoardSolve';
import { MathBlock } from '../components/MathBlock';
import pageStyles from './pages.module.scss';
import styles from '../features/solve/solve.module.scss';

const EXAMPLES = ['x^2 - 5x + 6 = 0', '2x + 3 = 7', 'x^2 - 9 = 0', 'x^2 + 2x + 1 = 0'];

export function CapturePage() {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [solution, setSolution] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [boardOpen, setBoardOpen] = useState(false);

  async function handleSolve(problem) {
    const p = (problem ?? input).trim();
    if (!p) return;
    setInput(p);
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await solveProblem(p);
      setSolution(res.solution);
      setStatus('done');
      setBoardOpen(true);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message);
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
          disabled={status === 'loading'}
        >
          {status === 'loading' ? t('solve.solving') : t('solve.action')}
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
        <BoardSolve solution={solution} onClose={() => setBoardOpen(false)} />
      )}
    </div>
  );
}
