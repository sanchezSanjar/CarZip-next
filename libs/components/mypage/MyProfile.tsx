import React, { useState } from 'react';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { initial } from '../../utils';
import Verified from '../common/Verified';

const contactFields = [
	{ key: 'contactPhone', icon: '☎', bg: 'var(--asphalt)', color: '#fff', placeholder: 'Shop phone' },
	{ key: 'contactEmail', icon: '@', bg: 'var(--line)', color: 'inherit', placeholder: 'Email' },
	{ key: 'contactKakao', icon: 'K', bg: '#FEE500', color: 'inherit', placeholder: 'KakaoTalk ID' },
	{ key: 'contactTelegram', icon: 'T', bg: '#229ED9', color: '#fff', placeholder: 'Telegram' },
	{ key: 'contactWhatsapp', icon: 'W', bg: '#25D366', color: '#fff', placeholder: 'WhatsApp' },
] as const;

type ContactKey = (typeof contactFields)[number]['key'];

/** own profile. Phone and password have their own flows; company and business number change only through an admin */
const MyProfile = () => {
	const user = useReactiveVar(userVar);
	const isAgent = user.memberType === MemberType.AGENT;
	const [nick, setNick] = useState(user.memberNick);
	const [fullName, setFullName] = useState('');
	const [address, setAddress] = useState('');
	const [desc, setDesc] = useState('');
	const [contacts, setContacts] = useState<Record<ContactKey, string>>({
		contactPhone: '',
		contactEmail: '',
		contactKakao: '',
		contactTelegram: '',
		contactWhatsapp: '',
	});

	return (
		<>
			<div className="main-head">
				<div>
					<h1>My profile</h1>
					<p>
						{isAgent
							? 'This is what people see on your dealer page and next to every car you list.'
							: 'Your nickname and photo show next to your comments.'}
					</p>
				</div>
			</div>
			<div className="prof">
				<div className="photo-card">
					<div className="bigavatar">
						{initial(user.memberNick)}
						<label className="cam" style={{ cursor: 'pointer' }}>
							📷
							<input type="file" accept="image/jpeg,image/png,image/webp" hidden />
						</label>
					</div>
					<b style={{ fontSize: 17 }}>{user.memberNick}</b>
					{isAgent && <Verified center />}
					<div className="hint" style={{ margin: '10px 0 12px' }}>
						Square photo or logo, at least 400 × 400 px. JPG, PNG or WebP.
					</div>
				</div>
				<div>
					<div className="formsec">
						<h2>About you</h2>
						<p>{isAgent ? 'Shown on your dealer page.' : 'Only your nickname is public.'}</p>
						<div className="fgrid">
							<div>
								<div className="label">Nickname</div>
								<input className="field" maxLength={12} value={nick} onChange={(e) => setNick(e.target.value)} />
							</div>
							<div>
								<div className="label">Your name</div>
								<input className="field" maxLength={50} value={fullName} onChange={(e) => setFullName(e.target.value)} />
							</div>
							{isAgent && (
								<div>
									<div className="label">Company name</div>
									<div className="field locked">
										Set at signup <span style={{ fontSize: 12 }}>Contact admin to change</span>
									</div>
								</div>
							)}
							<div className={isAgent ? '' : 'full'}>
								<div className="label">{isAgent ? 'Lot address' : 'Address'}</div>
								<input className="field" maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} />
							</div>
							{isAgent && (
								<div className="full">
									<div className="label">About the dealership</div>
									<textarea className="field" maxLength={500} value={desc} onChange={(e) => setDesc(e.target.value)} />
									<div className="hint">{desc.length} of 500 characters</div>
								</div>
							)}
						</div>
					</div>
					{isAgent && (
						<div className="formsec">
							<h2>Contact details</h2>
							<p>Visible to everyone, including people who aren&apos;t logged in. Leave a field empty to hide it.</p>
							<div className="cgrid">
								{contactFields.map((c) => (
									<div key={c.key} className="cfield">
										<span className="ic" style={{ background: c.bg, color: c.color }}>
											{c.icon}
										</span>
										<input
											style={{ border: 0, outline: 'none', flex: 1, fontFamily: 'inherit', fontSize: 14 }}
											placeholder={c.placeholder}
											value={contacts[c.key]}
											onChange={(e) => setContacts({ ...contacts, [c.key]: e.target.value })}
										/>
									</div>
								))}
							</div>
						</div>
					)}
					<div className="formsec">
						<h2>Account</h2>
						<p>Private. Only you and CarZip admins see this.</p>
						<div className="acc-row">
							<div>
								Login phone<small>Verified by SMS</small>
							</div>
							<button className="btn ghost sm">Change with SMS code</button>
						</div>
						<div className="acc-row">
							<div>
								Password<small>Changing it logs you out on other devices</small>
							</div>
							<button className="btn ghost sm">Change password</button>
						</div>
						{isAgent && (
							<div className="acc-row">
								<div>
									Business registration number<small>Checked by CarZip</small>
								</div>
								<span style={{ fontSize: 13, color: 'var(--muted)' }}>Contact admin to change</span>
							</div>
						)}
					</div>
					<div className="savebar">
						<button className="btn primary">Save changes</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MyProfile;
