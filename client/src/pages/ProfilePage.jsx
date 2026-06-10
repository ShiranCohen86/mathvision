import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthProvider';
import styles from './pages.module.scss';
import authStyles from '../features/auth/auth.module.scss';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading, signIn, signOut } = useAuth();

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('profile.title')}</h1>
      </header>

      {loading ? (
        <p className={styles.subtitle}>…</p>
      ) : user ? (
        <div className={authStyles.card}>
          {user.avatar && (
            <img
              className={authStyles.avatar}
              src={user.avatar}
              alt=""
              referrerPolicy="no-referrer"
            />
          )}
          <div className={authStyles.info}>
            <span className={authStyles.name}>{user.displayName}</span>
            <span className={authStyles.email}>{user.email}</span>
          </div>
          <button type="button" className={authStyles.signout} onClick={signOut}>
            {t('auth.signout')}
          </button>
        </div>
      ) : (
        <div className={authStyles.signinCard}>
          <p>{t('auth.signinPrompt')}</p>
          <button type="button" className={authStyles.googleBtn} onClick={signIn}>
            {t('auth.google')}
          </button>
        </div>
      )}
    </div>
  );
}
