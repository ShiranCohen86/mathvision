import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MathBlock } from '../../components/MathBlock';
import styles from './board.module.scss';

const BASE_WIPE = 1200; // ms to "write" one line at 1×
const GAP = 380; // pause between lines (ms at 1×)

/** A little piece of chalk that rides the writing tip. */
function ChalkPen() {
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden="true">
      <g transform="rotate(38 24 24)">
        <rect x="20" y="6" width="8" height="26" rx="3" fill="#f3f5ee" />
        <rect x="20" y="6" width="8" height="6" rx="3" fill="#d3dac9" />
        <polygon points="20,32 28,32 24,43" fill="#ffffff" />
      </g>
    </svg>
  );
}

/**
 * Full-screen "classroom board": the solution is written line by line by a
 * moving chalk, auto-scaled so the whole thing fits with no scrolling.
 */
export function BoardSolve({ solution, onClose, progressDelta }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'he').startsWith('he') ? 'he' : 'en';

  const steps = solution.methods?.[0]?.steps ?? [];
  const lines = [
    { latex: solution.problem.latex, caption: '', kind: 'problem' },
    ...steps.map((s) => ({
      latex: s.latex,
      caption: lang === 'he' ? s.explanationHe : s.explanationEn,
      kind: 'step',
    })),
  ];
  if (solution.finalAnswer) {
    lines.push({ latex: solution.finalAnswer, caption: t('solve.answer'), kind: 'answer' });
  }

  const [writing, setWriting] = useState(0);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    setWriting(0);
    setPaused(false);
  }, [solution]);

  // Lock background scroll + allow Escape to close.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // Scale the whole solution to fit the viewport — no scrolling.
  useLayoutEffect(() => {
    const fit = () => {
      const stage = stageRef.current;
      const content = contentRef.current;
      if (!stage || !content) return;
      const sw = stage.clientWidth - 24;
      const sh = stage.clientHeight - 24;
      const cw = content.scrollWidth;
      const ch = content.scrollHeight;
      if (cw > 0 && ch > 0) setScale(Math.min(1, sw / cw, sh / ch));
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (stageRef.current) ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [solution]);

  const done = writing >= lines.length;
  const dur = BASE_WIPE / speed;

  const onLineWritten = () => {
    window.setTimeout(() => setWriting((w) => Math.min(w + 1, lines.length)), GAP / speed);
  };

  const activeCaption = done
    ? (lines[lines.length - 1]?.caption ?? '')
    : (lines[writing]?.caption ?? '');

  return (
    <div
      className={`${styles.board} ${paused ? styles.paused : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('solve.board')}
    >
      <button type="button" className={styles.close} onClick={onClose} aria-label={t('solve.close')}>
        ✕
      </button>

      <div className={styles.stage} ref={stageRef}>
        <div className={styles.content} ref={contentRef} style={{ transform: `scale(${scale})` }}>
          {lines.map((line, i) => {
            const state = i < writing ? 'done' : i === writing ? 'writing' : 'pending';
            return (
              <div
                key={i}
                className={[styles.line, styles[line.kind], styles[state]]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className={styles.ink}>
                  <MathBlock latex={`\\displaystyle ${line.latex}`} display={false} />
                </span>
                {state === 'writing' && (
                  <span
                    className={styles.cover}
                    style={{ '--wipe': `${dur}ms` }}
                    onAnimationEnd={onLineWritten}
                  >
                    <span className={styles.pen}>
                      <ChalkPen />
                    </span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.caption}>{activeCaption}</p>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() => {
              setWriting(0);
              setPaused(false);
            }}
            aria-label={t('solve.restart')}
          >
            ↺
          </button>
          {!done && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? t('solve.play') : t('solve.pause')}
            >
              {paused ? '▶' : '❚❚'}
            </button>
          )}
          <div className={styles.speeds}>
            {[0.5, 1, 2].map((sp) => (
              <button
                type="button"
                key={sp}
                className={sp === speed ? styles.speedActive : ''}
                onClick={() => setSpeed(sp)}
              >
                {sp}×
              </button>
            ))}
          </div>
          {done && solution.verified && (
            <span className={styles.verified}>✓ {t('solve.verified')}</span>
          )}
          {done && progressDelta && (
            <span className={styles.xpGain}>
              +{progressDelta.gainedXp} XP
              {progressDelta.leveledUp ? ` · ${t('game.levelUp')}` : ''}
              {progressDelta.newAchievements?.length ? ' 🏆' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
