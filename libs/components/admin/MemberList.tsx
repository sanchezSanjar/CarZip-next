import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { UPDATE_MEMBER_BY_ADMIN } from '../../../apollo/admin/mutation';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { Direction } from '../../enums/common.enum';
import { Member, Members } from '../../types/member/member';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { dealerName, initial, timeAgo } from '../../utils';
import Pager from '../common/Pager';

const LIMIT = 10;

const statusPill: Record<MemberStatus, { cls: string; label: string }> = {
	[MemberStatus.ACTIVE]: { cls: 'active', label: 'Active' },
	[MemberStatus.PENDING]: { cls: 'hold', label: 'Pending review' },
	[MemberStatus.REJECTED]: { cls: 'rej', label: 'Declined' },
	[MemberStatus.BLOCK]: { cls: 'rej', label: 'Blocked' },
	[MemberStatus.DELETE]: { cls: 'sold', label: 'Deleted' },
};

/** how many members a tab has: a one-row query that only reads the total */
const TabCount = ({ memberType, memberStatus }: { memberType: MemberType; memberStatus?: MemberStatus }) => {
	const { data } = useQuery<{ getAllMembersByAdmin: Members }>(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: { memberType, ...(memberStatus ? { memberStatus } : {}) } } },
	});
	return <span className="num">{data?.getAllMembersByAdmin.metaCounter?.[0]?.total ?? 0}</span>;
};

/**
 * Admin: dealers or buyers. Blocking is CarZip-wide (the member can't log in);
 * blocking a dealer puts their cars on hold and deleting deletes them.
 */
const MemberList = ({ memberType }: { memberType: MemberType.AGENT | MemberType.USER }) => {
	const isAgent = memberType === MemberType.AGENT;
	const statuses = isAgent
		? [MemberStatus.ACTIVE, MemberStatus.PENDING, MemberStatus.REJECTED, MemberStatus.BLOCK, MemberStatus.DELETE]
		: [MemberStatus.ACTIVE, MemberStatus.BLOCK, MemberStatus.DELETE];
	const [status, setStatus] = useState<MemberStatus | undefined>();
	const [text, setText] = useState('');
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('createdAt');
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getAllMembersByAdmin: Members }>(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page, limit: LIMIT, sort, direction: Direction.DESC, search: { memberType, ...(status ? { memberStatus: status } : {}), ...(search ? { text: search } : {}) } },
		},
	});
	const [updateMember] = useMutation(UPDATE_MEMBER_BY_ADMIN, { refetchQueries: [GET_ALL_MEMBERS_BY_ADMIN] });
	const rows = data?.getAllMembersByAdmin.list ?? [];
	const total = data?.getAllMembersByAdmin.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const change = async (m: Member, input: { memberStatus: MemberStatus }, question: string, confirmText: string, done: string) => {
		if (!(await sweetConfirmAlert(question, confirmText, true))) return;
		try {
			await updateMember({ variables: { input: { _id: m._id, ...input } } });
			await sweetTopSuccessAlert(done, 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const name = (m: Member) => dealerName(m);
	const block = (m: Member) =>
		change(
			m,
			{ memberStatus: MemberStatus.BLOCK },
			`Block ${name(m)} on all of CarZip? They can't log in${isAgent ? ', their cars go on hold' : ''} and their open test drives are cancelled.`,
			'Block',
			'Blocked',
		);
	const remove = (m: Member) =>
		change(
			m,
			{ memberStatus: MemberStatus.DELETE },
			`Delete ${name(m)}?${isAgent ? ' Their cars are deleted and' : ''} open test drives are cancelled.`,
			'Delete',
			'Deleted',
		);
	const restore = (m: Member) => change(m, { memberStatus: MemberStatus.ACTIVE }, `Make ${name(m)} active again?`, 'Restore', 'Restored');
	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? 'Dealers' : 'Members'}</h1>
					<p>
						{isAgent
							? 'Blocking a dealer puts their cars on hold; deleting a dealer deletes their cars. Either cancels their open test drives.'
							: "Blocking here is CarZip-wide: the member can't log in."}
					</p>
				</div>
				{isAgent && (
					<Link href="/_admin/applications" className="btn ghost">
						Pending applications (<TabCount memberType={MemberType.AGENT} memberStatus={MemberStatus.PENDING} />)
					</Link>
				)}
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					{[undefined, ...statuses].map((s) => (
						<span
							key={s ?? 'all'}
							className={`chip ${status === s ? 'on' : ''}`}
							onClick={() => {
								setStatus(s);
								setPage(1);
							}}
						>
							{s ? statusPill[s].label : 'All'} <TabCount memberType={memberType} memberStatus={s} />
						</span>
					))}
				</div>
				<div className="grow" />
				<form
					onSubmit={(e) => {
						e.preventDefault();
						setSearch(text.trim());
						setPage(1);
					}}
				>
					<input className="field" style={{ width: 240 }} placeholder="Search nickname" value={text} onChange={(e) => setText(e.target.value)} />
				</form>
				<select className="field" style={{ width: 180, fontWeight: 600 }} value={sort} onChange={(e) => setSort(e.target.value)}>
					<option value="createdAt">Newest</option>
					<option value="memberWarnings">Most warnings</option>
					<option value="memberBlocks">Most blocked by dealers</option>
					{isAgent && <option value="memberCars">Most cars</option>}
				</select>
			</div>
			<div className="block" style={{ opacity: loading && rows.length ? 0.6 : 1 }}>
				<table>
					<thead>
						<tr>
							<th>{isAgent ? 'Dealer' : 'Member'}</th>
							<th>Phone</th>
							{isAgent && <th>Business number</th>}
							{isAgent ? <th>Cars</th> : <th>Comments</th>}
							<th>Blocked by</th>
							<th>Joined</th>
							<th>Status</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.map((m) => (
							<tr key={m._id}>
								<td>
									<div className="person">
										<div className={`avatar ${isAgent ? '' : 'user'}`}>{initial(name(m))}</div>
										<div>
											{isAgent && m.memberStatus === MemberStatus.ACTIVE ? (
												<Link href={`/agent/detail?id=${m._id}`} style={{ color: 'inherit' }}>
													<b>{name(m)}</b>
												</Link>
											) : (
												<b>{name(m)}</b>
											)}
											<small>{isAgent ? m.memberNick : m.memberFullName || '—'}</small>
										</div>
									</div>
								</td>
								<td className="num">{m.memberPhone}</td>
								{isAgent && <td className="num">{m.agentBusinessNo || '—'}</td>}
								<td className="num">{isAgent ? m.memberCars : m.memberComments}</td>
								<td className="num" style={(m.memberBlocks ?? 0) >= 3 ? { color: 'var(--stop)', fontWeight: 700 } : undefined}>
									{m.memberBlocks ?? 0}
								</td>
								<td>{timeAgo(m.createdAt)}</td>
								<td>
									<span className={`pill ${statusPill[m.memberStatus].cls}`}>{statusPill[m.memberStatus].label}</span>
								</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{m.memberStatus === MemberStatus.PENDING && (
											<Link href="/_admin/applications" className="btn dark sm">
												Review
											</Link>
										)}
										{m.memberStatus === MemberStatus.ACTIVE && (
											<>
												<button className="btn danger sm" onClick={() => block(m)}>
													Block
												</button>
											</>
										)}
										{(m.memberStatus === MemberStatus.BLOCK || m.memberStatus === MemberStatus.DELETE) && (
											<button className="btn dark sm" onClick={() => restore(m)}>
												{m.memberStatus === MemberStatus.BLOCK ? 'Unblock' : 'Restore'}
											</button>
										)}
										{m.memberStatus !== MemberStatus.DELETE && m.memberStatus !== MemberStatus.PENDING && (
											<button className="btn danger sm" onClick={() => remove(m)}>
												Delete
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!loading && !rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>Nobody here</h3>
						<p>{search ? 'No nickname matches.' : 'No members with this status.'}</p>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MemberList;
