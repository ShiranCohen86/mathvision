import { useTranslation } from 'react-i18next';
import styles from './pages.module.scss';

export function ProfilePage() {
  const { t } = useTranslation();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('profile.title')}</h1>
      </header>

      <button type="button" className={styles.signinBtn} disabled>
        {t('profile.signin')}
      </button>

      <div className={styles.placeholder}>
        <span className={styles.badge}>Phase 0</span>
        <p>{t('profile.soon')}</p>
      </div>
    </div>
  );
}
