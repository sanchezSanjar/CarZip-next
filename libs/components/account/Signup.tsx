import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getErrorMessage, requestOtp, signUp, verifyOtp } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { MemberType } from '../../enums/member.enum';
import { OtpPurpose } from '../../enums/otp.enum';
import { MemberInput } from '../../types/member/member.input';
import OtpInput from './OtpInput';
import { Trans, useTranslation } from 'next-i18next/pages';

// the same rules the API checks, so mistakes show before sending
const rules = {
	phone: /^01\d{8,9}$/,
	nick: /^[A-Za-z0-9_]{3,12}$/,
	businessNo: /^\d{3}-?\d{2}-?\d{5}$/,
};

const contactFields = [
	{ key: 'contactPhone', icon: '☎', bg: 'var(--asphalt)', color: '#fff', placeholder: 'account.phShopPhone' },
	{ key: 'contactEmail', icon: '@', bg: 'var(--line)', color: 'inherit', placeholder: 'account.phEmail' },
	{ key: 'contactKakao', icon: 'K', bg: '#FEE500', color: 'inherit', placeholder: 'account.phKakao' },
	{ key: 'contactTelegram', icon: 'T', bg: '#229ED9', color: '#fff', placeholder: 'account.phTelegram' },
	{ key: 'contactWhatsapp', icon: 'W', bg: '#25D366', color: '#fff', placeholder: 'account.phWhatsapp' },
] as const;

type ContactKey = (typeof contactFields)[number]['key'];

/**
 * Sign up in two steps: 1) verify the phone with an SMS code, 2) account details.
 * A buyer is logged in right away; a dealer waits for an admin to approve the account.
 */
const Signup = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [loading, setLoading] = useState(false);

	// step 1
	const [phone, setPhone] = useState('');
	const [codeSent, setCodeSent] = useState(false);
	const [code, setCode] = useState('');

	// step 2
	const [memberType, setMemberType] = useState<MemberType>(router.query.type === 'AGENT' ? MemberType.AGENT : MemberType.USER);
	const [nick, setNick] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [company, setCompany] = useState('');
	const [businessNo, setBusinessNo] = useState('');
	const [contacts, setContacts] = useState<Record<ContactKey, string>>({
		contactPhone: '',
		contactEmail: '',
		contactKakao: '',
		contactTelegram: '',
		contactWhatsapp: '',
	});
	const [agreed, setAgreed] = useState(false);

	const isAgent = memberType === MemberType.AGENT;
	const phoneDigits = phone.replace(/\D/g, '');

	const errors = {
		nick: nick && !rules.nick.test(nick) ? t('account.ruleNick') : '',
		password: password && (password.length < 6 || password.length > 30) ? t('account.rulePassword') : '',
		fullName: fullName && (fullName.trim().length < 2 || fullName.length > 50) ? t('account.ruleName') : '',
		company: company && (company.trim().length < 2 || company.length > 100) ? t('account.ruleCompany') : '',
		businessNo: businessNo && !rules.businessNo.test(businessNo) ? t('account.ruleBusinessNo') : '',
	};
	const canSubmit =
		agreed &&
		rules.nick.test(nick) &&
		password.length >= 6 &&
		password.length <= 30 &&
		(isAgent ? company.trim().length >= 2 && rules.businessNo.test(businessNo) : fullName.trim().length >= 2) &&
		!Object.values(errors).some(Boolean);

	/** HANDLERS **/
	const sendCode = async () => {
		if (!rules.phone.test(phoneDigits)) return sweetMixinErrorAlert(t('account.enterMobile'));
		setLoading(true);
		try {
			await requestOtp(phoneDigits, OtpPurpose.SIGNUP);
			setCodeSent(true);
			setCode('');
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const checkCode = async () => {
		setLoading(true);
		try {
			await verifyOtp(phoneDigits, OtpPurpose.SIGNUP, code);
			setStep(2);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setLoading(false);
		}
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!canSubmit) return;
		const input: MemberInput = { memberNick: nick, memberPassword: password, memberPhone: phoneDigits, memberType };
		if (isAgent) {
			input.agentCompany = company.trim();
			input.agentBusinessNo = businessNo; // required for dealers
			(Object.keys(contacts) as ContactKey[]).forEach((k) => {
				if (contacts[k].trim()) input[k] = contacts[k].trim();
			});
		} else {
			input.memberFullName = fullName.trim();
		}

		setLoading(true);
		try {
			await signUp(input);
			if (isAgent) setStep(3); // under review, no login yet
			else await router.push('/');
		} catch {
			// signUp already showed the server's message (e.g. nickname taken)
		} finally {
			setLoading(false);
		}
	};

	if (step === 3) {
		return (
			<div className="pending">
				<div className="clock" />
				<h2>{t('account.reviewTitle')}</h2>
				<p>{t('account.reviewText')}</p>
				<div className="timeline">
					<div className="tl done">
						<i />
						<div>{t('account.tlPhone')}</div>
					</div>
					<div className="tl done">
						<i />
						<div>{t('account.tlSent')}</div>
					</div>
					<div className="tl now">
						<i />
						<div>
							{t('account.tlChecking')}
							<span>{t('account.tlInProgress')}</span>
						</div>
					</div>
					<div className="tl">
						<i />
						<div>
							{t('account.tlStart')}
							<span>{t('account.tlStartText')}</span>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="stepper">
				<span className={step === 1 ? 'now' : 'done'} />
				<span className={step === 2 ? 'now' : ''} />
			</div>
			<div className="steplabel">{t('account.stepOf', { step, total: 2 })}</div>

			{step === 1 && (
				<div className="authcard">
					<h1>{t('account.verifyPhone')}</h1>
					<p>{t('account.verifyText')}</p>
					<div className="label">{t('account.phone')}</div>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 8 }}>
						<input
							className="field num"
							inputMode="tel"
							placeholder="010-1234-5678"
							value={phone}
							disabled={codeSent}
							onChange={(e) => setPhone(e.target.value)}
						/>
						<button className="btn dark" type="button" onClick={sendCode} disabled={loading || !phoneDigits}>
							{codeSent ? t('account.sendAgain') : t('account.sendCode')}
						</button>
					</div>
					{codeSent && (
						<>
							<div className="label" style={{ marginTop: 18 }}>
								{t('account.code6')}
							</div>
							<OtpInput value={code} onChange={setCode} />
							<div className="timerline">
								<span>{t('account.expires')}</span>
								<a style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => setCodeSent(false)}>
									{t('account.changeNumber')}
								</a>
							</div>
							<button
								className="btn primary"
								type="button"
								style={{ width: '100%', height: 50, marginTop: 20 }}
								disabled={loading || code.length !== 6}
								onClick={checkCode}
							>
								{t('account.verifyCode')}
							</button>
						</>
					)}
				</div>
			)}

			{step === 2 && (
				<form className="formcard" onSubmit={submit}>
					<h1>{t('account.createTitle')}</h1>
					<p>{t('account.createText')}</p>
					<div className="types">
						<div className={`type ${!isAgent ? 'on' : ''}`} onClick={() => setMemberType(MemberType.USER)}>
							<b>
								{t('account.buying')} <i className={`radio ${!isAgent ? 'on' : ''}`} />
							</b>
							<p>{t('account.buyingText')}</p>
						</div>
						<div className={`type ${isAgent ? 'on' : ''}`} onClick={() => setMemberType(MemberType.AGENT)}>
							<b>
								{t('account.dealer')} <i className={`radio ${isAgent ? 'on' : ''}`} />
							</b>
							<p>{t('account.dealerText')}</p>
						</div>
					</div>
					<div className="fgrid">
						<div>
							<div className="label">{t('account.nickname')}</div>
							<input className={`field ${errors.nick ? 'err' : ''}`} value={nick} onChange={(e) => setNick(e.target.value)} />
							<div className={`hint ${errors.nick ? 'err' : ''}`}>{errors.nick || t('account.ruleNick')}</div>
						</div>
						<div>
							<div className="label">{t('account.password')}</div>
							<input
								className={`field ${errors.password ? 'err' : ''}`}
								type="password"
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
							<div className={`hint ${errors.password ? 'err' : ''}`}>{errors.password || t('account.atLeast6')}</div>
						</div>
						{isAgent ? (
							<>
								<div>
									<div className="label">{t('account.company')}</div>
									<input className={`field ${errors.company ? 'err' : ''}`} value={company} onChange={(e) => setCompany(e.target.value)} />
									{errors.company && <div className="hint err">{errors.company}</div>}
								</div>
								<div>
									<div className="label">{t('account.businessNo')}</div>
									<input
										className={`field num ${errors.businessNo ? 'err' : ''}`}
										placeholder="123-45-67890"
										value={businessNo}
										onChange={(e) => setBusinessNo(e.target.value)}
									/>
									<div className={`hint ${errors.businessNo ? 'err' : ''}`}>{errors.businessNo || t('account.businessNoHint')}</div>
								</div>
							</>
						) : (
							<div className="full">
								<div className="label">{t('account.fullName')}</div>
								<input className={`field ${errors.fullName ? 'err' : ''}`} value={fullName} onChange={(e) => setFullName(e.target.value)} />
								{errors.fullName && <div className="hint err">{errors.fullName}</div>}
							</div>
						)}
					</div>

					{isAgent && (
						<>
							<div className="subhead">{t('account.contactsTitle')}</div>
							<p>{t('account.contactsText')}</p>
							<div className="cgrid">
								{contactFields.map((c) => (
									<div key={c.key} className="cfield">
										<span className="ic" style={{ background: c.bg, color: c.color }}>
											{c.icon}
										</span>
										<input
											style={{ border: 0, outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 14 }}
											placeholder={t(c.placeholder)}
											value={contacts[c.key]}
											onChange={(e) => setContacts({ ...contacts, [c.key]: e.target.value })}
										/>
									</div>
								))}
							</div>
						</>
					)}

					<label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 14, margin: '18px 0', cursor: 'pointer' }}>
						<input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} style={{ marginTop: 3 }} />
						<span>
							<Trans t={t} i18nKey="account.agree" components={{ terms: <Link href="/cs?tab=terms" target="_blank" /> }} />
						</span>
					</label>
					<button className="btn primary" style={{ width: '100%', height: 50 }} disabled={loading || !canSubmit}>
						{isAgent ? t('account.sendReview') : t('account.createBtn')}
					</button>
				</form>
			)}
		</div>
	);
};

export default Signup;
