import { useTranslation } from 'react-i18next';
import { useTheme } from '../app/ThemeProvider';
import { SunIcon, MoonIcon } from './icons';
import styles from './controls.module.scss';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={toggle}
      aria-label={t('common.theme')}
    >
      {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
    </button>
  );
}
