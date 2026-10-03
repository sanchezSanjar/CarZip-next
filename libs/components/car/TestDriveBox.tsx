import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { REQUEST_TEST_DRIVE } from '../../../apollo/user/mutation';
import { getErrorMessage } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next/pages';

const MAX_DAYS = 60;

/** "YYYY-MM-DD" in local time, for the date input's min/max */
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** a buyer asks the dealer for a test drive. The dealer confirms or declines; both get notified */
const TestDriveBox = ({ carId }: { carId: string }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [range] = useState(() => {
		const tomorrow = new Date(Date.now() + 86400000);
		return { min: ymd(tomorrow), max: ymd(new Date(Date.now() + MAX_DAYS * 86400000)) };
	});
	const [date, setDate] = useState(range.min);
	const [time, setTime] = useState('10:30');
	const [message, setMessage] = useState('');
	const [sent, setSent] = useState(false);
	const [requestTestDrive, { loading }] = useMutation(REQUEST_TEST_DRIVE);

	/** HANDLERS **/
	const send = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user._id) {
			await router.push('/account/join?mode=login');
			return;
		}
		const when = new Date(`${date}T${time}`);
		try {
			await requestTestDrive({
				variables: { input: { carId, testDriveDate: when.toISOString(), ...(message.trim() ? { testDriveMessage: message.trim() } : {}) } },
			});
			setSent(true);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err)); // e.g. already requested, or blocked by the dealer
		}
	};

	if (sent) {
		return (
			<div className="panel td">
				<h3>{t('td.sent')}</h3>
				<div className="sub">{t('td.sentText')}</div>
				<Link href="/mypage?category=testDrives" className="btn dark" style={{ width: '100%' }}>
					{t('td.seeMine')}
				</Link>
			</div>
		);
	}

	return (
		<form className="panel td" onSubmit={send}>
			<h3>{t('td.title')}</h3>
			<div className="sub">{t('td.sub', { days: MAX_DAYS })}</div>
			<div className="two">
				<input className="field" type="date" required min={range.min} max={range.max} value={date} onChange={(e) => setDate(e.target.value)} />
				<input className="field" type="time" required step={1800} value={time} onChange={(e) => setTime(e.target.value)} />
			</div>
			<textarea
				className="field ta2"
				placeholder={t('td.message')}
				maxLength={300}
				value={message}
				onChange={(e) => setMessage(e.target.value)}
			/>
			<button className="btn primary" style={{ width: '100%' }} disabled={loading}>
				{user._id ? (loading ? t('td.sending') : t('td.request')) : t('td.logIn')}
			</button>
		</form>
	);
};

export default TestDriveBox;
