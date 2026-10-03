import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { CHANGE_PASSWORD } from '../../../apollo/user/mutation';
import { Member } from '../../types/member/member';
import { getErrorMessage, updateStorage, updateUserInfo } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';

/** change password inside "Account". Other devices are logged out; this one gets a new token */
const ChangePassword = () => {
	const [open, setOpen] = useState(false);
	const [oldPassword, setOldPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [saving, setSaving] = useState(false);
	const [changePassword] = useMutation<{ changePassword: Member }>(CHANGE_PASSWORD);

	const error =
		newPassword && (newPassword.length < 6 || newPassword.length > 30)
			? '6 to 30 characters'
			: repeat && newPassword !== repeat
				? 'The two new passwords are different'
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
			await sweetTopSuccessAlert('Password changed. Other devices were logged out.', 1800);
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
					Password<small>Changing it logs you out on other devices</small>
				</div>
				{!open && (
					<button className="btn ghost sm" onClick={() => setOpen(true)}>
						Change password
					</button>
				)}
			</div>
			{open && (
				<form onSubmit={save} className="fgrid3" style={{ marginTop: 14, alignItems: 'end' }}>
					<div>
						<div className="label">Current password</div>
						<input className="field" type="password" autoComplete="current-password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
					</div>
					<div>
						<div className="label">New password</div>
						<input className="field" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
					</div>
					<div>
						<div className="label">Repeat new password</div>
						<input className="field" type="password" autoComplete="new-password" value={repeat} onChange={(e) => setRepeat(e.target.value)} />
					</div>
					<div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<span className="hint err">{error}</span>
						<span style={{ display: 'flex', gap: 8 }}>
							<button type="button" className="btn ghost sm" onClick={close}>
								Cancel
							</button>
							<button className="btn primary sm" disabled={!ready || saving}>
								{saving ? 'Saving…' : 'Save new password'}
							</button>
						</span>
					</div>
				</form>
			)}
		</div>
	);
};

export default ChangePassword;
