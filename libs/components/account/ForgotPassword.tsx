import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getErrorMessage, requestOtp, resetPassword, verifyOtp } from '../../auth';
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { OtpPurpose } from '../../enums/otp.enum';
import OtpInput from './OtpInput';

/**
 * 1) phone, 2) SMS code, 3) new password.
 * Also how a dealer created by an admin sets a first password.
 */
const ForgotPassword = () => {
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
			? '6 to 30 characters'
			: password2 && password !== password2
				? 'The two passwords are different'
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
			await sweetMixinSuccessAlert('Password changed. Please log in.');
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
			<div className="steplabel">Step {step} of 3</div>

			{step === 1 && (
				<form onSubmit={sendCode}>
					<h1>Forgot password</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>Enter the phone number of your account.</p>
					<div className="label">Phone number</div>
					<input className="field num" inputMode="tel" placeholder="010-1234-5678" value={phone} onChange={(e) => setPhone(e.target.value)} />
					<button className="btn primary" style={{ width: '100%', height: 50, marginTop: 20 }} disabled={loading || !phoneDigits}>
						Send code
					</button>
					<div className="hint" style={{ textAlign: 'center', marginTop: 14 }}>
						<Link href="/account/join?mode=login">Back to log in</Link>
					</div>
				</form>
			)}

			{step === 2 && (
				<form onSubmit={checkCode}>
					<h1>Enter the code</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>
						If <b className="num">{masked}</b> is registered, we sent a 6-digit code to it.
					</p>
					<OtpInput value={code} onChange={setCode} />
					<div className="timerline">
						<span>The code expires in 3 minutes.</span>
						<a style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setStep(1)}>
							Send a new code
						</a>
					</div>
					<button className="btn primary" style={{ width: '100%', height: 50, marginTop: 20 }} disabled={loading || code.length !== 6}>
						Verify code
					</button>
					<div className="hint" style={{ textAlign: 'center', marginTop: 14 }}>
						Next you choose a new password. You&apos;ll be logged out on other devices.
					</div>
				</form>
			)}

			{step === 3 && (
				<form onSubmit={savePassword}>
					<h1>New password</h1>
					<p style={{ color: 'var(--muted)', margin: '6px 0 22px' }}>Choose a password you don&apos;t use anywhere else.</p>
					<div className="stack">
						<div>
							<div className="label">New password</div>
							<input className="field" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
						</div>
						<div>
							<div className="label">Repeat the new password</div>
							<input className="field" type="password" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
							{passwordError && <div className="hint err">{passwordError}</div>}
						</div>
					</div>
					<button
						className="btn primary"
						style={{ width: '100%', height: 50, marginTop: 20 }}
						disabled={loading || !password || password !== password2 || !!passwordError}
					>
						Save new password
					</button>
				</form>
			)}
		</div>
	);
};

export default ForgotPassword;
