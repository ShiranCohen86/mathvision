import { useTranslation } from 'react-i18next';
import styles from './pages.module.scss';

export function LearnPage() {
  const { t } = useTranslation();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('learn.title')}</h1>
      </header>

      <div className={styles.placeholder}>
        <span className={styles.badge}>Phase 3–4</span>
        <p>{t('learn.soon')}</p>
      </div>
    </div>
  );
}
