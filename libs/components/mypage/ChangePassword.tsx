import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CHANGE_PASSWORD } from '../../../apollo/user/mutation';
import { Member } from '../../types/member/member';
import { getErrorMessage, updateStorage, updateUserInfo } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next/pages';

/** change password inside "Account". Other devices are logged out; this one gets a new token */
const ChangePassword = () => {
	const { t } = useTranslation('common');
	const [open, setOpen] = useState(false);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [saving, setSaving] = useState(false);
	const [changePassword] = useMutation<{ changePassword: Member }>(CHANGE_PASSWORD);

	const error =
		newPassword && (newPassword.length < 6 || newPassword.length > 30)
			? t('account.rulePassword')
			: repeat && newPassword !== repeat
				? t('account.passwordsDiffer')
				: '';
	const ready = oldPassword && newPassword && newPassword === repeat && !error;

	const close = () => {
		setOpen(false);
		setOldPassword('');
		setNewPassword('');
		setRepeat('');
	};

	const save = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!ready) return;
		setSaving(true);
		try {
			const { data } = await changePassword({ variables: { input: { oldPassword, newPassword } } });
			const token = data?.changePassword.accessToken;
			if (token) {
				updateStorage({ jwtToken: token });
				updateUserInfo(token);
			}
			close();
			await sweetTopSuccessAlert(t('pw.changed'), 1800);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="acc-row" style={{ display: 'block' }}>
			<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
				<div>
					{t('account.password')}
					<small>{t('pw.note')}</small>
				</div>
				{!open && (
					<button className="btn ghost sm" onClick={() => setOpen(true)}>
						{t('pw.change')}
					</button>
				)}
			</div>
			{open && (
				<form onSubmit={save} className="fgrid3" style={{ marginTop: 14, alignItems: 'end' }}>
					<div>
						<div className="label">{t('pw.current')}</div>
						<input className="field" type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
					</div>
					<div>
						<div className="label">{t('account.newPassword')}</div>
						<input className="field" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
					</div>
					<div>
						<div className="label">{t('account.repeatPassword')}</div>
						<input className="field" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
					</div>
					<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span className="hint err">{error}</span>
						<span style={{ display: 'flex', gap: 8 }}>
							<button type="button" className="btn ghost sm" onClick={close}>
								{t('my.cancel')}
							</button>
							<button className="btn primary sm" disabled={!ready || saving}>
								{saving ? t('my.saving') : t('account.savePassword')}
							</button>
						</span>
					</div>
				</form>
			)}
		</div>
	);
};

export default ChangePassword;
