import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RTL_LANGS } from '../i18n';

/**
 * Keeps <html lang> and <html dir> in sync with the active language so the
 * whole UI mirrors correctly (He → rtl, En → ltr). Math islands opt back into
 * LTR via the `.ltr-math` class.
 */
export function useDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language || 'he';
    const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [i18n.language]);
}
