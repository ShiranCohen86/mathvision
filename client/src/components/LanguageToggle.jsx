import { useTranslation } from 'react-i18next';
import { GlobeIcon } from './icons';
import styles from './controls.module.scss';

export function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const isHe = (i18n.language || 'he').startsWith('he');
  const next = isHe ? 'en' : 'he';

  return (
    <button
      type="button"
      className={styles.iconBtn}
      onClick={() => void i18n.changeLanguage(next)}
      aria-label={t('common.language')}
    >
      <GlobeIcon size={18} />
      <span>{isHe ? 'EN' : 'עב'}</span>
    </button>
  );
}
