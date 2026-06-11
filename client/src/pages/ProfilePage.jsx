import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../app/AuthProvider';
import { getFamily, createFamily, joinFamily, leaveFamily } from '../lib/api';
import styles from './pages.module.scss';
import authStyles from '../features/auth/auth.module.scss';
import famStyles from '../features/family/family.module.scss';

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, loading, signIn, signOut } = useAuth();
  const [family, setFamily] = useState(undefined); // undefined = loading, null = none
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setFamily(undefined);
      return;
    }
    getFamily()
      .then((r) => setFamily(r.family))
      .catch(() => setFamily(null));
  }, [user]);

  async function doCreate() {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      const r = await createFamily(name.trim());
      setFamily(r.family);
      setName('');
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function doJoin() {
    if (!code.trim() || busy) return;
    setBusy(true);
    try {
      const r = await joinFamily(code.trim());
      setFamily(r.family);
      setCode('');
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  async function doLeave() {
    setBusy(true);
    try {
      await leaveFamily();
      setFamily(null);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t('profile.title')}</h1>
      </header>

      {loading ? (
        <p className={styles.subtitle}>…</p>
      ) : !user ? (
        <div className={authStyles.signinCard}>
          <p>{t('auth.signinPrompt')}</p>
          <button type="button" className={authStyles.googleBtn} onClick={signIn}>
            {t('auth.google')}
          </button>
        </div>
      ) : (
        <>
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

          <section>
            <h2 className={famStyles.title}>{t('family.title')}</h2>

            {family === undefined ? (
              <p className={styles.subtitle}>…</p>
            ) : family ? (
              <div className={famStyles.card}>
                <div className={famStyles.head}>
                  <span className={famStyles.famName}>{family.name}</span>
                  <button
                    type="button"
                    className={famStyles.code}
                    onClick={() => navigator.clipboard?.writeText(family.code)}
                    title={t('family.copy')}
                  >
                    {family.code}
                  </button>
                </div>
                <p className={famStyles.hint}>{t('family.invite')}</p>
                <ul className={famStyles.members}>
                  {family.members.map((m, i) => (
                    <li key={i} className={famStyles.member}>
                      {m.avatar ? (
                        <img
                          className={famStyles.mAvatar}
                          src={m.avatar}
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className={famStyles.mAvatar} />
                      )}
                      <span className={famStyles.mName}>
                        {m.displayName}
                        {m.me ? ` (${t('family.you')})` : ''}
                      </span>
                      <span className={famStyles.mLvl}>
                        {t('game.lvl')} {m.level}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={famStyles.leave}
                  onClick={doLeave}
                  disabled={busy}
                >
                  {t('family.leave')}
                </button>
              </div>
            ) : (
              <div className={famStyles.forms}>
                <div className={famStyles.formRow}>
                  <input
                    className={famStyles.input}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('family.namePlaceholder')}
                  />
                  <button type="button" className={famStyles.btn} onClick={doCreate} disabled={busy}>
                    {t('family.create')}
                  </button>
                </div>
                <div className={famStyles.or}>{t('family.or')}</div>
                <div className={famStyles.formRow}>
                  <input
                    className={famStyles.input}
                    value={code}
                    dir="ltr"
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder={t('family.codePlaceholder')}
                  />
                  <button type="button" className={famStyles.btn} onClick={doJoin} disabled={busy}>
                    {t('family.join')}
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
