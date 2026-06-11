import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthProvider';
import { getProgress, getHistory } from '../lib/api';
import { BackendStatus } from '../components/BackendStatus';
import { BoardSolve } from '../features/solve/BoardSolve';
import { MathBlock } from '../components/MathBlock';
import { PlusIcon } from '../components/icons';
import styles from './pages.module.scss';

export function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [recents, setRecents] = useState([]);
  const [replay, setReplay] = useState(null);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setRecents([]);
      return;
    }
    getProgress()
      .then(setProgress)
      .catch(() => setProgress(null));
    getHistory()
      .then((r) => setRecents((r.items ?? []).slice(0, 4)))
      .catch(() => setRecents([]));
  }, [user]);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('home.title')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
        {progress && (
          <div className={styles.homeChips}>
            <span className={styles.statChip}>🔥 {progress.streak?.current ?? 0}</span>
            <span className={styles.statChip}>
              {t('game.lvl')} {progress.level ?? 1}
            </span>
            <span className={styles.statChip}>{progress.xp ?? 0} XP</span>
          </div>
        )}
      </header>

      <section className={styles.heroCard}>
        <p className={styles.heroText}>{t('app.tagline')}</p>
        <Link to="/capture" className={styles.ctaButton}>
          <PlusIcon size={20} />
          {t('home.cta')}
        </Link>
        <BackendStatus />
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('home.recent')}</h2>
        {recents.length === 0 ? (
          <div className={styles.placeholder}>
            <p>{t('home.empty')}</p>
          </div>
        ) : (
          <ul className={styles.recentList}>
            {recents.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={styles.recentItem}
                  onClick={() => setReplay(it.solution)}
                >
                  <span className={styles.recentMath}>
                    <MathBlock latex={it.problemLatex || it.input} display={false} />
                  </span>
                  <span className={styles.recentAnswer}>
                    <MathBlock latex={it.finalAnswer} display={false} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {replay && <BoardSolve solution={replay} onClose={() => setReplay(null)} />}
    </div>
  );
}
