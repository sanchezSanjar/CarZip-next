import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getErrorMessage, requestOtp, resetPassword, verifyOtp } from '../../auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { OtpPurpose } from '../../enums/otp.enum';
import OtpInput from './OtpInput';
import { Trans, useTranslation } from 'next-i18next/pages';

/**
 * 1) phone, 2) SMS code, 3) new password.
 * Also how a dealer created by an admin sets a first password.
 */
const ForgotPassword = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [loading, setLoading] = useState(false);
	const [phone, setPhone] = useState('');
	const [code, setCode] = useState('');
	const [resetToken, setResetToken] = useState('');
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');

	const phoneDigits = phone.replace(/\D/g, '');
	const masked = phoneDigits.replace(/^(\d{3})(\d{2})\d*(\d{2})$/, '$1-$2•• ••$3');
	const passwordError =
		password && (password.length < 6 || password.length > 30)
			? t('account.rulePassword')
			: password2 && password !== password2
				? t('account.passwordsDiffer')
				: '';

	/** HANDLERS **/
	const run = async (task: () => Promise<void>) => {
		setLoading(true);
		try {
			await task();
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const sendCode = (e: React.FormEvent) => {
		e.preventDefault();
		run(async () => {
			await requestOtp(phoneDigits, OtpPurpose.RESET_PASSWORD);
			setCode('');
			setStep(2);
		});
	};

	const checkCode = (e: React.FormEvent) => {
		e.preventDefault();
		run(async () => {
			const token = await verifyOtp(phoneDigits, OtpPurpose.RESET_PASSWORD, code);
			if (!token) throw new Error('Something went wrong!');
			setResetToken(token);
			setStep(3);
		});
	};

	const savePassword = (e: React.FormEvent) => {
		e.preventDefault();
		run(async () => {
			await resetPassword(resetToken, password);
			await sweetMixinSuccessAlert(t('account.passwordChanged'));
			await router.push('/account/join?mode=login');
		});
	};

	return (
		<div className="authcard">
			<div className="stepper">
				{[1, 2, 3].map((s) => (
					<span key={s} className={s < step ? 'done' : s === step ? 'now' : ''} />
				))}
			</div>
			<div className="steplabel">{t('account.stepOf', { step, total: 3 })}</div>

			{step === 1 && (
				<form onSubmit={sendCode}>
					<h1>{t('account.forgotTitle')}</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>{t('account.forgotText')}</p>
					<div className="label">{t('account.phone')}</div>
					<input className="field num" inputMode="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
					<button className="btn primary" style={{ width: '100%', height: 50, marginTop: 20 }} disabled={loading || !phoneDigits}>
						{t('account.sendCode')}
					</button>
					<div className="hint" style={{ textAlign: 'center', marginTop: 14 }}>
						<Link href="/account/join?mode=login">{t('account.backToLogin')}</Link>
					</div>
				</form>
			)}

			{step === 2 && (
				<form onSubmit={checkCode}>
					<h1>{t('account.enterCode')}</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>
						<Trans t={t} i18nKey="account.sentTo" values={{ phone: masked }} components={{ b: <b className="num" /> }} />
					</p>
					<OtpInput value={code} onChange={setCode} />
					<div className="timerline">
						<span>{t('account.expires')}</span>
						<a style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(1)}>
							{t('account.newCode')}
						</a>
					</div>
					<button className="btn primary" style={{ width: '100%', height: 50, marginTop: 20 }} disabled={loading || code.length !== 6}>
						{t('account.verifyCode')}
					</button>
					<div className="hint" style={{ textAlign: 'center', marginTop: 14 }}>
						{t('account.nextStepNote')}
					</div>
				</form>
			)}

			{step === 3 && (
				<form onSubmit={savePassword}>
					<h1>{t('account.newPassword')}</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>{t('account.newPasswordText')}</p>
					<div className="stack">
						<div>
							<div className="label">{t('account.newPassword')}</div>
							<input className="field" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<div>
							<div className="label">{t('account.repeatPassword')}</div>
							<input className="field" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
							{passwordError && <div className="hint err">{passwordError}</div>}
						</div>
					</div>
					<button
						className="btn primary"
						style={{ width: '100%', height: 50, marginTop: 20 }}
						disabled={loading || !password || password !== password2 || !!passwordError}
					>
						{t('account.savePassword')}
					</button>
				</form>
			)}
		</div>
	);
};

export default ForgotPassword;
