import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client/react';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { Members } from '../../../libs/types/member/member';
import { getErrorMessage } from '../../../libs/auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { timeAgo } from '../../../libs/utils';
import Avatar from '../../../libs/components/common/Avatar';

/** time left of the 24-hour promise: green, amber, then red when late */
const timer = (applied: Date, now: number) => {
	const left = 24 - Math.floor((now - new Date(applied).getTime()) / 3600000);
	if (left < 0) return { cls: 'late', text: `${-left} h late` };
	return { cls: left <= 6 ? 'warn' : 'ok', text: `${left} h left` };
};

/** pending dealer applications, oldest first: approve, or decline with a reason the applicant receives */
const Applications: NextPage = () => {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [reason, setReason] = useState('');
	const [now] = useState(() => Date.now());

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getAllMembersByAdmin: Members }>(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page: 1, limit: 50, sort: 'createdAt', direction: Direction.ASC, search: { memberType: MemberType.AGENT, memberStatus: MemberStatus.PENDING } },
		},
	});
	const [updateMember, { loading: saving }] = useMutation(UPDATE_MEMBER_BY_ADMIN, { refetchQueries: [GET_ALL_MEMBERS_BY_ADMIN] });
	const applications = data?.getAllMembersByAdmin.list ?? [];
	const selected = applications.find((a) => a._id === selectedId) ?? applications[0];
	const reasonOk = reason.trim().length >= 5 && reason.length <= 300;

	/** HANDLERS **/
	const decide = async (status: MemberStatus.ACTIVE | MemberStatus.REJECTED) => {
		if (!selected) return;
		const approve = status === MemberStatus.ACTIVE;
		const question = approve
			? `Approve ${selected.agentCompany}? They can log in and list cars right away.`
			: `Decline ${selected.agentCompany}? They get a notification with your reason.`;
		if (!(await sweetConfirmAlert(question, approve ? 'Approve' : 'Decline', !approve))) return;
		try {
			await updateMember({ variables: { input: { _id: selected._id, memberStatus: status, ...(approve ? {} : { agentRejectReason: reason.trim() }) } } });
			setReason('');
			setSelectedId(null);
			await sweetTopSuccessAlert(approve ? 'Dealer approved' : 'Application declined', 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Dealer applications</h1>
					<p>We promise an answer within 24 hours. Oldest first.</p>
				</div>
			</div>
			{!loading && !applications.length ? (
				<div className="empty">
					<h3>No applications waiting</h3>
					<p>New dealer signups show up here.</p>
				</div>
			) : (
				<div className="review">
					<div className="block" style={{ margin: 0 }}>
						<table>
							<thead>
								<tr>
									<th>Applicant</th>
									<th>Business number</th>
									<th>Applied</th>
									<th>Time left</th>
								</tr>
							</thead>
							<tbody>
								{applications.map((a) => {
									const t = timer(a.createdAt, now);
									const on = a._id === selected?._id;
									return (
										<tr
											key={a._id}
											onClick={() => {
												setSelectedId(a._id);
												setReason('');
											}}
											style={{ cursor: 'pointer', ...(on ? { background: '#F4F8FD', boxShadow: 'inset 3px 0 0 var(--road)' } : {}) }}
										>
											<td>
												<div className="person">
													<Avatar image={a.memberImage} dealer />
													<div>
														<b>{a.agentCompany}</b>
														<small>{a.memberNick}</small>
													</div>
												</div>
											</td>
											<td className="num">{a.agentBusinessNo || '—'}</td>
											<td>{timeAgo(a.createdAt)}</td>
											<td>
												<span className={`timer ${t.cls}`}>{t.text}</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
					{selected && (
						<div className="appdetail">
							<h2>{selected.agentCompany}</h2>
							<div style={{ color: 'var(--muted)', fontSize: 14 }}>
								Applied {timeAgo(selected.createdAt)} by {selected.memberNick}
								{selected.memberFullName ? ` (${selected.memberFullName})` : ''}
							</div>
							<div className="check-row">
								<div>
									Business number<small>Optional at signup for now</small>
								</div>
								<span className="okmark">{selected.agentBusinessNo || 'Not given'}</span>
							</div>
							<div className="check-row">
								<div>
									Login phone<small>Verified by SMS at signup</small>
								</div>
								<span className="okmark num">{selected.memberPhone}</span>
							</div>
							<div className="check-row">
								<div>
									Public contacts<small>Shown on listings after approval</small>
								</div>
								<span style={{ fontSize: 13, textAlign: 'right' }}>
									{[selected.contactPhone, selected.contactEmail, selected.contactKakao, selected.contactTelegram, selected.contactWhatsapp].filter(Boolean).join(' · ') || 'None'}
								</span>
							</div>
							{selected.agentBusinessCard && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={selected.agentBusinessCard} alt="Business card" style={{ width: '100%', borderRadius: 10, marginTop: 12 }} />
							)}
							<textarea
								className="field reason"
								placeholder="Reason for declining (sent to the applicant, 5 to 300 characters)"
								maxLength={300}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
								<button className="btn danger" disabled={!reasonOk || saving} onClick={() => decide(MemberStatus.REJECTED)}>
									Decline
								</button>
								<button className="btn good" disabled={saving} onClick={() => decide(MemberStatus.ACTIVE)}>
									Approve dealer
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export default withLayoutAdmin(Applications);
