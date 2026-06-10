import { useTranslation } from 'react-i18next';
import styles from './pages.module.scss';

export function CapturePage() {
  const { t } = useTranslation();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('capture.title')}</h1>
        <p className={styles.subtitle}>{t('capture.subtitle')}</p>
      </header>

      <div className={styles.placeholder}>
        <span className={styles.badge}>Phase 1</span>
        <p>{t('capture.soon')}</p>
      </div>
    </div>
  );
}
