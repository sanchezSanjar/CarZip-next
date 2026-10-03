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
import Avatar from '../../../libs/components/common/Avatar';
import { withTranslations } from '../../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../../libs/hooks/useLocaleFormat';

/** time left of the 24-hour promise: green, amber, then red when late */
const timer = (applied: Date, now: number) => {
	const left = 24 - Math.floor((now - new Date(applied).getTime()) / 3600000);
	if (left < 0) return { cls: 'late', key: 'adm.hLate', hours: -left };
	return { cls: left <= 6 ? 'warn' : 'ok', key: 'adm.hLeft', hours: left };
};

/** pending dealer applications, oldest first: approve, or decline with a reason the applicant receives */
const Applications: NextPage = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
			? t('adm.approveQ', { name: selected.agentCompany })
			: t('adm.declineQ', { name: selected.agentCompany });
		if (!(await sweetConfirmAlert(question, approve ? t('adm.approve') : t('tds.decline'), !approve))) return;
		try {
			await updateMember({ variables: { input: { _id: selected._id, memberStatus: status, ...(approve ? {} : { agentRejectReason: reason.trim() }) } } });
			setReason('');
			setSelectedId(null);
			await sweetTopSuccessAlert(approve ? t('adm.approved') : t('adm.declinedDone'), 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{t('adm.mApplications')}</h1>
					<p>{t('adm.appsSub')}</p>
				</div>
			</div>
			{!loading && !applications.length ? (
				<div className="empty">
					<h3>{t('adm.noApps')}</h3>
					<p>{t('adm.noAppsText')}</p>
				</div>
			) : (
				<div className="review">
					<div className="block" style={{ margin: 0 }}>
						<table>
							<thead>
								<tr>
									<th>{t('adm.applicant')}</th>
									<th>{t('pf.businessNo')}</th>
									<th>{t('adm.applied')}</th>
									<th>{t('adm.timeLeft')}</th>
								</tr>
							</thead>
							<tbody>
								{applications.map((a) => {
									const left = timer(a.createdAt, now);
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
											<td>{fmt.timeAgo(a.createdAt)}</td>
											<td>
												<span className={`timer ${left.cls}`}>{t(left.key, { count: left.hours })}</span>
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
								{t('adm.appliedBy', { time: fmt.timeAgo(selected.createdAt), nick: selected.memberNick })}
								{selected.memberFullName ? ` (${selected.memberFullName})` : ''}
							</div>
							<div className="check-row">
								<div>
									{t('pf.businessNo')}
									<small>{t('adm.bizOptional')}</small>
								</div>
								<span className="okmark">{selected.agentBusinessNo || t('pf.notGiven')}</span>
							</div>
							<div className="check-row">
								<div>
									{t('pf.loginPhone')}
									<small>{t('adm.phoneVerified')}</small>
								</div>
								<span className="okmark num">{selected.memberPhone}</span>
							</div>
							<div className="check-row">
								<div>
									{t('adm.contacts')}
									<small>{t('adm.contactsNote')}</small>
								</div>
								<span style={{ fontSize: 13, textAlign: 'right' }}>
									{[selected.contactPhone, selected.contactEmail, selected.contactKakao, selected.contactTelegram, selected.contactWhatsapp].filter(Boolean).join(' · ') || t('adm.none')}
								</span>
							</div>
							{selected.agentBusinessCard && (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={selected.agentBusinessCard} alt={t('adm.bizCard')} style={{ width: '100%', borderRadius: 10, marginTop: 12 }} />
							)}
							<textarea
								className="field reason"
								placeholder={t('adm.reasonPh')}
								maxLength={300}
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
								<button className="btn danger" disabled={!reasonOk || saving} onClick={() => decide(MemberStatus.REJECTED)}>
									{t('tds.decline')}
								</button>
								<button className="btn good" disabled={saving} onClick={() => decide(MemberStatus.ACTIVE)}>
									{t('adm.approveDealer')}
								</button>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutAdmin(Applications);
