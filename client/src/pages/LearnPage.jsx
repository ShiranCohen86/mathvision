import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthProvider';
import { getProgress, getLeaderboard } from '../lib/api';
import pageStyles from './pages.module.scss';
import authStyles from '../features/auth/auth.module.scss';
import styles from '../features/game/game.module.scss';

const ACHIEVEMENTS = [
  { key: 'first-solve', icon: '🎯' },
  { key: 'ten-solves', icon: '🔟' },
  { key: 'fifty-solves', icon: '🏅' },
  { key: 'streak-3', icon: '🔥' },
  { key: 'streak-7', icon: '🌟' },
  { key: 'level-5', icon: '⭐' },
  { key: 'verified-10', icon: '✅' },
];

export function LearnPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signIn } = useAuth();
  const [progress, setProgress] = useState(null);
  const [board, setBoard] = useState(null);

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setBoard(null);
      return;
    }
    getProgress().then(setProgress).catch(() => setProgress(null));
    getLeaderboard()
      .then((r) => setBoard(r.items))
      .catch(() => setBoard([]));
  }, [user]);

  if (authLoading) {
    return (
      <div className={`container ${pageStyles.page}`}>
        <p className={pageStyles.subtitle}>…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`container ${pageStyles.page}`}>
        <header className={pageStyles.header}>
          <h1 className={pageStyles.title}>{t('nav.learn')}</h1>
        </header>
        <div className={authStyles.signinCard}>
          <p>{t('game.signin')}</p>
          <button type="button" className={authStyles.googleBtn} onClick={signIn}>
            {t('auth.google')}
          </button>
        </div>
      </div>
    );
  }

  const earned = new Set((progress?.achievements ?? []).map((a) => a.key));
  const ratio = Math.round((progress?.ratio ?? 0) * 100);
  const toNext = Math.max(0, (progress?.nextLevelXp ?? 0) - (progress?.xp ?? 0));

  return (
    <div className={`container ${pageStyles.page}`}>
      <header className={pageStyles.header}>
        <h1 className={pageStyles.title}>{t('nav.learn')}</h1>
      </header>

      <section className={styles.levelCard}>
        <div className={styles.levelBadge}>
          {t('game.level')} {progress?.level ?? 1}
        </div>
        <div className={styles.xpWrap}>
          <div className={styles.xpBar}>
            <span style={{ width: `${ratio}%` }} />
          </div>
          <span className={styles.xpText}>
            {progress?.xp ?? 0} XP · {toNext} {t('game.toNext')}
          </span>
        </div>
      </section>

      <section className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>🔥</span>
          <span className={styles.statNum}>{progress?.streak?.current ?? 0}</span>
          <span className={styles.statLabel}>{t('game.streak')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>🧮</span>
          <span className={styles.statNum}>{progress?.solvedCount ?? 0}</span>
          <span className={styles.statLabel}>{t('game.solved')}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>✓</span>
          <span className={styles.statNum}>{progress?.verifiedCount ?? 0}</span>
          <span className={styles.statLabel}>{t('game.verified')}</span>
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('game.achievements')}</h2>
        <div className={styles.achGrid}>
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.key}
              className={`${styles.ach} ${earned.has(a.key) ? styles.achEarned : ''}`}
            >
              <span className={styles.achIcon}>{a.icon}</span>
              <span className={styles.achLabel}>{t(`game.ach.${a.key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{t('game.leaderboard')}</h2>
        {board === null ? (
          <p className={pageStyles.subtitle}>…</p>
        ) : board.length === 0 ? (
          <div className={pageStyles.placeholder}>
            <p>{t('game.noBoard')}</p>
          </div>
        ) : (
          <ul className={styles.board}>
            {board.map((row) => (
              <li
                key={row.rank}
                className={`${styles.boardRow} ${row.me ? styles.boardMe : ''}`}
              >
                <span className={styles.rank}>{row.rank}</span>
                {row.avatar ? (
                  <img
                    className={styles.boardAvatar}
                    src={row.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className={styles.boardAvatar} />
                )}
                <span className={styles.boardName}>{row.displayName}</span>
                <span className={styles.boardLvl}>
                  {t('game.lvl')} {row.level}
                </span>
                <span className={styles.boardXp}>{row.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
