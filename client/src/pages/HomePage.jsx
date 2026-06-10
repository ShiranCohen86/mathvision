import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BackendStatus } from '../components/BackendStatus';
import { PlusIcon } from '../components/icons';
import styles from './pages.module.scss';

export function HomePage() {
  const { t } = useTranslation();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('home.title')}</h1>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
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
        <div className={styles.placeholder}>
          <p>{t('home.empty')}</p>
        </div>
      </section>
    </div>
  );
}
