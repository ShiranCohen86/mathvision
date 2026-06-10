import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getHealth } from '../lib/api';
import styles from './controls.module.scss';

export function BackendStatus() {
  const { t } = useTranslation();
  const [state, setState] = useState('checking');

  useEffect(() => {
    let alive = true;
    getHealth()
      .then(() => alive && setState('ok'))
      .catch(() => alive && setState('down'));
    return () => {
      alive = false;
    };
  }, []);

  const label =
    state === 'ok'
      ? t('common.backendOk')
      : state === 'down'
        ? t('common.backendDown')
        : t('common.checking');

  return (
    <span className={styles.status}>
      <span className={styles.dot} data-state={state} />
      {label}
    </span>
  );
}
