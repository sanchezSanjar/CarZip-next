import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER } from '../../../apollo/user/query';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { MemberType } from '../../enums/member.enum';
import { Member } from '../../types/member/member';
import { MemberUpdate } from '../../types/member/member.update';
import { getErrorMessage, updateStorage, updateUserInfo } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { uploadImages } from '../../upload';
import { dealerName, initial } from '../../utils';
import Verified from '../common/Verified';

const contactFields = [
	{ key: 'contactPhone', icon: '☎', bg: 'var(--asphalt)', color: '#fff', placeholder: 'Shop phone' },
	{ key: 'contactEmail', icon: '@', bg: 'var(--line)', color: 'inherit', placeholder: 'Email' },
	{ key: 'contactKakao', icon: 'K', bg: '#FEE500', color: 'inherit', placeholder: 'KakaoTalk ID' },
	{ key: 'contactTelegram', icon: 'T', bg: '#229ED9', color: '#fff', placeholder: 'Telegram' },
	{ key: 'contactWhatsapp', icon: 'W', bg: '#25D366', color: '#fff', placeholder: 'WhatsApp' },
] as const;

type Editable = Required<Pick<MemberUpdate, 'memberNick' | 'memberFullName' | 'memberImage' | 'memberAddress' | 'memberDesc' | (typeof contactFields)[number]['key']>>;

const toForm = (m: Member): Editable => ({
	memberNick: m.memberNick,
	memberFullName: m.memberFullName ?? '',
	memberImage: m.memberImage ?? '',
	memberAddress: m.memberAddress ?? '',
	memberDesc: m.memberDesc ?? '',
	contactPhone: m.contactPhone ?? '',
	contactEmail: m.contactEmail ?? '',
	contactKakao: m.contactKakao ?? '',
	contactTelegram: m.contactTelegram ?? '',
	contactWhatsapp: m.contactWhatsapp ?? '',
});

/** loads my profile first, then shows the form filled with it */
const MyProfile = () => {
	const user = useReactiveVar(userVar);
	const { data, loading } = useQuery<{ getMember: Member }>(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user._id },
		skip: !user._id,
	});
	if (loading || !data) return <p className="muted">Loading your profile…</p>;
	return <ProfileForm key={data.getMember.updatedAt.toString()} member={data.getMember} />;
};

/** own profile. Phone and password have their own flows; company and business number change only through an admin */
const ProfileForm = ({ member }: { member: Member }) => {
	const isAgent = member.memberType === MemberType.AGENT;
	const initialForm = toForm(member);
	const [form, setForm] = useState<Editable>(initialForm);
	const [uploading, setUploading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [updateMember] = useMutation<{ updateMember: Member }>(UPDATE_MEMBER, { refetchQueries: [GET_MEMBER] });

	const set = (key: keyof Editable, value: string) => setForm({ ...form, [key]: value });
	// only what changed is sent; an emptied contact field is sent as '' so the API clears it
	const changes = (Object.keys(form) as (keyof Editable)[]).filter((k) => form[k] !== initialForm[k]);
	const nickError = /^[A-Za-z0-9_]{3,12}$/.test(form.memberNick) ? '' : '3 to 12 letters, digits or _';

	/** HANDLERS **/
	const changePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		setUploading(true);
		try {
			const [img] = await uploadImages([file], 'member');
			set('memberImage', img.url);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setUploading(false);
		}
	};

	const save = async () => {
		if (!changes.length || nickError) return;
		const input: MemberUpdate = Object.fromEntries(changes.map((k) => [k, form[k].trim()]));
		setSaving(true);
		try {
			const { data } = await updateMember({ variables: { input } });
			// the token carries the nick, so the API sends a new one
			const token = data?.updateMember.accessToken;
			if (token) {
				updateStorage({ jwtToken: token });
				updateUserInfo(token);
			}
			await sweetTopSuccessAlert('Profile saved', 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setSaving(false);
		}
	};

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
				{isAgent && (
					<Link href={`/agent/detail?id=${member._id}`} className="btn ghost">
						View my dealer page
					</Link>
				)}
			</div>
			<div className="prof">
				<div className="photo-card">
					<div className="bigavatar" style={form.memberImage ? { background: 'none' } : undefined}>
						{form.memberImage ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={form.memberImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 28 }} />
						) : (
							initial(dealerName(member))
						)}
						<label className="cam" style={{ cursor: uploading ? 'wait' : 'pointer' }} title="Change photo">
							📷
							<input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading} onChange={changePhoto} />
						</label>
					</div>
					<b style={{ fontSize: 17 }}>{dealerName(member)}</b>
					{isAgent && <Verified center />}
					<div className="hint" style={{ margin: '10px 0 12px' }}>
						{uploading ? 'Uploading…' : 'Square photo or logo, at least 400 × 400 px. JPG, PNG or WebP.'}
					</div>
					{form.memberImage && (
						<button className="btn ghost sm" onClick={() => set('memberImage', '')}>
							Remove photo
						</button>
					)}
				</div>
				<div>
					<div className="formsec">
						<h2>About you</h2>
						<p>{isAgent ? 'Shown on your dealer page.' : 'Only your nickname is public.'}</p>
						<div className="fgrid">
							<div>
								<div className="label">Nickname</div>
								<input className={`field ${nickError ? 'err' : ''}`} maxLength={12} value={form.memberNick} onChange={(e) => set('memberNick', e.target.value)} />
								{nickError && <div className="hint err">{nickError}</div>}
							</div>
							<div>
								<div className="label">Your name</div>
								<input className="field" maxLength={50} value={form.memberFullName} onChange={(e) => set('memberFullName', e.target.value)} />
							</div>
							{isAgent && (
								<div>
									<div className="label">Company name</div>
									<div className="field locked">
										{member.agentCompany}
										<span style={{ fontSize: 12 }}>Contact admin to change</span>
									</div>
								</div>
							)}
							<div className={isAgent ? '' : 'full'}>
								<div className="label">{isAgent ? 'Lot address' : 'Address'}</div>
								<input className="field" maxLength={200} value={form.memberAddress} onChange={(e) => set('memberAddress', e.target.value)} />
							</div>
							{isAgent && (
								<div className="full">
									<div className="label">About the dealership</div>
									<textarea className="field" maxLength={500} value={form.memberDesc} onChange={(e) => set('memberDesc', e.target.value)} />
									<div className="hint">{form.memberDesc.length} of 500 characters</div>
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
											value={form[c.key]}
											onChange={(e) => set(c.key, e.target.value)}
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
								Login phone<small className="num">{member.memberPhone}</small>
							</div>
						</div>
						{isAgent && (
							<div className="acc-row">
								<div>
									Business registration number<small className="num">{member.agentBusinessNo || 'Not given'}</small>
								</div>
								<span style={{ fontSize: 13, color: 'var(--muted)' }}>Contact admin to change</span>
							</div>
						)}
					</div>
					<div className="savebar">
						{changes.length > 0 && <span className="t">You have unsaved changes</span>}
						<button className="btn ghost" disabled={!changes.length || saving} onClick={() => setForm(initialForm)}>
							Discard
						</button>
						<button className="btn primary" disabled={!changes.length || !!nickError || saving || uploading} onClick={save}>
							{saving ? 'Saving…' : 'Save changes'}
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default MyProfile;
