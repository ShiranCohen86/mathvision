import { useTranslation } from 'react-i18next';
import styles from './pages.module.scss';

export function HistoryPage() {
  const { t } = useTranslation();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('history.title')}</h1>
      </header>

      <div className={styles.placeholder}>
        <p>{t('history.empty')}</p>
      </div>
    </div>
  );
}
