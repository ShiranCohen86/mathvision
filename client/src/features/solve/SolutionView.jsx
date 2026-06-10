import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MathBlock } from '../../components/MathBlock';
import {
  PlayIcon,
  PauseIcon,
  PrevIcon,
  NextIcon,
  RestartIcon,
  CheckIcon,
} from '../../components/icons';
import styles from './solve.module.scss';

const SPEEDS = [0.5, 1, 2];
const BASE_DELAY = 1500; // ms per step at 1×

export function SolutionView({ solution }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'he').startsWith('he') ? 'he' : 'en';

  const method = solution.methods[0];
  const steps = method.steps;
  const total = steps.length;

  const [visible, setVisible] = useState(1);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const timer = useRef(null);

  // Restart playback whenever a new solution arrives.
  useEffect(() => {
    setVisible(1);
    setPlaying(true);
  }, [solution]);

  // Auto-advance while playing.
  useEffect(() => {
    if (!playing) return undefined;
    if (visible >= total) {
      setPlaying(false);
      return undefined;
    }
    timer.current = setTimeout(
      () => setVisible((v) => Math.min(v + 1, total)),
      BASE_DELAY / speed,
    );
    return () => clearTimeout(timer.current);
  }, [playing, visible, total, speed]);

  const done = visible >= total;

  const handleMainButton = () => {
    if (done) {
      setVisible(1);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  return (
    <section className={styles.solution} aria-live="polite">
      <div className={styles.problem}>
        <MathBlock latex={solution.problem.latex} />
      </div>

      <ol className={styles.steps}>
        {steps.slice(0, visible).map((s, i) => (
          <li
            key={s.ordinal}
            className={`${styles.step} ${i === visible - 1 ? styles.stepEnter : ''}`}
          >
            <div className={styles.stepMath}>
              <MathBlock latex={s.latex} />
            </div>
            <div className={styles.stepMeta}>
              <span className={styles.stepText}>
                {lang === 'he' ? s.explanationHe : s.explanationEn}
              </span>
              {s.verified && (
                <span className={styles.badge}>
                  <CheckIcon size={13} />
                  {t('solve.verified')}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {done && (
        <div className={`${styles.answer} ${solution.verified ? styles.answerOk : ''}`}>
          <span className={styles.answerLabel}>{t('solve.answer')}</span>
          <div className={styles.answerMath}>
            <MathBlock latex={solution.finalAnswer} />
          </div>
          {solution.verified && (
            <span className={styles.badgeBig}>
              <CheckIcon size={16} />
              {t('solve.verified')}
            </span>
          )}
        </div>
      )}

      <div className={styles.controls} dir="ltr">
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={() => {
            setVisible(1);
            setPlaying(false);
          }}
          aria-label={t('solve.restart')}
        >
          <RestartIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={() => setVisible((v) => Math.max(1, v - 1))}
          disabled={visible <= 1}
          aria-label={t('solve.prev')}
        >
          <PrevIcon size={18} />
        </button>
        <button
          type="button"
          className={styles.playBtn}
          onClick={handleMainButton}
          aria-label={done ? t('solve.restart') : playing ? t('solve.pause') : t('solve.play')}
        >
          {done ? <RestartIcon size={20} /> : playing ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
        </button>
        <button
          type="button"
          className={styles.ctrlBtn}
          onClick={() => setVisible((v) => Math.min(total, v + 1))}
          disabled={done}
          aria-label={t('solve.next')}
        >
          <NextIcon size={18} />
        </button>
        <span className={styles.counter}>{t('solve.step', { n: visible, total })}</span>
        <div className={styles.speeds}>
          {SPEEDS.map((sp) => (
            <button
              type="button"
              key={sp}
              className={sp === speed ? styles.speedActive : styles.speedBtn}
              onClick={() => setSpeed(sp)}
            >
              {sp}×
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
