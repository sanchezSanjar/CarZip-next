import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { logIn } from '../../auth';
import { useTranslation } from 'next-i18next/pages';

/** log in with a nickname or phone number and a password */
const Login = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [nickOrPhone, setNickOrPhone] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	/** HANDLERS **/
	const doLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!nickOrPhone.trim() || !password) return;
		setLoading(true);
		try {
			await logIn(nickOrPhone.trim(), password);
			await router.push('/');
		} catch {
			// logIn already showed the server's message (wrong password, under review, blocked)
		} finally {
			setLoading(false);
		}
	};

	return (
		<form className="authcard" onSubmit={doLogin}>
			<h1>{t('account.logIn')}</h1>
			<p>{t('account.welcomeBack')}</p>
			<div className="stack">
				<div>
					<div className="label">{t('account.nickOrPhone')}</div>
					<input
						className="field"
						value={nickOrPhone}
						autoComplete="username"
						onChange={(e) => setNickOrPhone(e.target.value)}
					/>
				</div>
				<div>
					<div className="label">{t('account.password')}</div>
					<input
						className="field"
						type="password"
						value={password}
						autoComplete="current-password"
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			</div>
			<div style={{ display: 'flex', justifyContent: 'flex-end', margin: '14px 0 20px', fontSize: 14 }}>
				<Link href="/account/join?mode=forgot" style={{ fontWeight: 600 }}>
					{t('account.forgot')}
				</Link>
			</div>
			<button className="btn primary" style={{ width: '100%', height: 50 }} disabled={loading || !nickOrPhone || !password}>
				{loading ? t('account.loggingIn') : t('account.logInBtn')}
			</button>
			<div className="or">{t('account.newHere')}</div>
			<Link href="/account/join?mode=signup" className="btn ghost" style={{ width: '100%' }}>
				{t('account.createAccount')}
			</Link>
		</form>
	);
};

export default Login;
