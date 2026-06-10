import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { HomeIcon, ClockIcon, PlusIcon, CapIcon, UserIcon } from './icons';
import styles from './AppShell.module.scss';

function navClass({ isActive }) {
  return isActive ? `${styles.navItem} ${styles.active}` : styles.navItem;
}

export function AppShell() {
  const { t } = useTranslation();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img className={styles.brandMark} src="/favicon.svg" alt="" />
          <span>{t('app.name')}</span>
        </div>
        <div className={styles.spacer} />
        <LanguageToggle />
        <ThemeToggle />
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav} aria-label={t('app.name')}>
        <NavLink end to="/" className={navClass}>
          <HomeIcon />
          <span>{t('nav.home')}</span>
        </NavLink>
        <NavLink to="/history" className={navClass}>
          <ClockIcon />
          <span>{t('nav.history')}</span>
        </NavLink>
        <NavLink to="/capture" className={styles.cta} aria-label={t('nav.capture')}>
          <PlusIcon size={26} />
        </NavLink>
        <NavLink to="/learn" className={navClass}>
          <CapIcon />
          <span>{t('nav.learn')}</span>
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          <UserIcon />
          <span>{t('nav.profile')}</span>
        </NavLink>
      </nav>
    </div>
  );
}
