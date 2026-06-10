import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthProvider';
import { getHistory } from '../lib/api';
import { MathBlock } from '../components/MathBlock';
import styles from './pages.module.scss';
import authStyles from '../features/auth/auth.module.scss';

export function HistoryPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading, signIn } = useAuth();
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (!user) {
      setItems(null);
      return;
    }
    getHistory()
      .then((r) => setItems(r.items))
      .catch(() => setItems([]));
  }, [user]);

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('history.title')}</h1>
      </header>

      {authLoading ? (
        <p className={styles.subtitle}>…</p>
      ) : !user ? (
        <div className={authStyles.signinCard}>
          <p>{t('history.signin')}</p>
          <button type="button" className={authStyles.googleBtn} onClick={signIn}>
            {t('auth.google')}
          </button>
        </div>
      ) : items === null ? (
        <p className={styles.subtitle}>…</p>
      ) : items.length === 0 ? (
        <div className={styles.placeholder}>
          <p>{t('history.empty')}</p>
        </div>
      ) : (
        <ul className={authStyles.historyList}>
          {items.map((it) => (
            <li key={it.id} className={authStyles.historyItem}>
              <div className={authStyles.histMath}>
                <MathBlock latex={it.problemLatex || it.input} display={false} />
              </div>
              <div className={authStyles.histAnswer}>
                <MathBlock latex={it.finalAnswer} display={false} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
