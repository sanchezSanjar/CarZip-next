import React, { useState } from 'react';
import { MemberStatus, MemberType } from '../../enums/member.enum';
import { initial } from '../../utils';
import Pager from '../common/Pager';

interface Row {
	_id: string;
	nick: string;
	company?: string;
	city: string;
	phone: string;
	businessNo?: string;
	cars?: number;
	warnings: number;
	status: MemberStatus;
}

// sample rows from the UI design
const dealers: Row[] = [
	{ _id: 'd1', nick: 'mokdongmotors', company: 'Mokdong Motors', city: 'Seoul', phone: '010-23•• ••89', businessNo: '123-45-67890', cars: 42, warnings: 0, status: MemberStatus.ACTIVE },
	{ _id: 'd2', nick: 'gangnampremium', company: 'Gangnam Premium', city: 'Seoul', phone: '010-34•• ••90', businessNo: '220-87-11042', cars: 57, warnings: 1, status: MemberStatus.ACTIVE },
	{ _id: 'd9', nick: 'pyeongtaekauto', company: 'Pyeongtaek Auto', city: 'Incheon', phone: '010-45•• ••01', businessNo: '312-45-90871', cars: 0, warnings: 4, status: MemberStatus.BLOCK },
	{ _id: 'd3', nick: 'haeundaecars', company: 'Haeundae Cars', city: 'Busan', phone: '010-56•• ••12', businessNo: '605-12-33481', cars: 33, warnings: 0, status: MemberStatus.ACTIVE },
	{ _id: 'p3', nick: 'bp_carcenter', company: 'Bupyeong Car Center', city: 'Incheon', phone: '010-45•• ••12', businessNo: '214-81-33092', cars: 0, warnings: 0, status: MemberStatus.PENDING },
];
const buyers: Row[] = [
	{ _id: 'u1', nick: 'hyejin_k', city: 'Busan', phone: '010-58•• ••21', warnings: 0, status: MemberStatus.ACTIVE },
	{ _id: 'u2', nick: 'dongwoo', city: 'Seoul', phone: '010-44•• ••09', warnings: 0, status: MemberStatus.ACTIVE },
	{ _id: 'u4', nick: 'car_hunter88', city: 'Seoul', phone: '010-77•• ••50', warnings: 3, status: MemberStatus.ACTIVE },
	{ _id: 'u5', nick: 'rider_kim', city: 'Daegu', phone: '010-12•• ••88', warnings: 1, status: MemberStatus.ACTIVE },
	{ _id: 'u6', nick: 'spam_seller01', city: 'Seoul', phone: '010-90•• ••11', warnings: 5, status: MemberStatus.BLOCK },
];

const statusPill: Record<MemberStatus, { cls: string; label: string }> = {
	[MemberStatus.ACTIVE]: { cls: 'active', label: 'Active' },
	[MemberStatus.PENDING]: { cls: 'hold', label: 'Pending review' },
	[MemberStatus.REJECTED]: { cls: 'rej', label: 'Rejected' },
	[MemberStatus.BLOCK]: { cls: 'rej', label: 'Blocked' },
	[MemberStatus.DELETE]: { cls: 'sold', label: 'Deleted' },
};

/** admin: dealers or buyers. Blocking is CarZip-wide; blocking or deleting a dealer also affects their cars */
const MemberList = ({ memberType }: { memberType: MemberType.AGENT | MemberType.USER }) => {
	const isAgent = memberType === MemberType.AGENT;
	const all = isAgent ? dealers : buyers;
	const [status, setStatus] = useState<MemberStatus | ''>('');
	const [text, setText] = useState('');
	const [page, setPage] = useState(1);
	const statuses = isAgent
		? [MemberStatus.ACTIVE, MemberStatus.PENDING, MemberStatus.BLOCK, MemberStatus.DELETE]
		: [MemberStatus.ACTIVE, MemberStatus.BLOCK, MemberStatus.DELETE];
	const rows = all.filter((r) => (!status || r.status === status) && `${r.nick} ${r.company ?? ''}`.toLowerCase().includes(text.toLowerCase()));

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
				{isAgent && <button className="btn primary">Add dealer</button>}
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					<span className={`chip ${status === '' ? 'on' : ''}`} onClick={() => setStatus('')}>
						All <span className="num">{all.length}</span>
					</span>
					{statuses.map((s) => (
						<span key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
							{statusPill[s].label} <span className="num">{all.filter((r) => r.status === s).length}</span>
						</span>
					))}
				</div>
				<div className="grow" />
				<input className="field" style={{ width: 300 }} placeholder={isAgent ? 'Search name or nickname' : 'Search nickname'} value={text} onChange={(e) => setText(e.target.value)} />
			</div>
			<div className="block">
				<table>
					<thead>
						<tr>
							<th>{isAgent ? 'Dealer' : 'Member'}</th>
							<th>Phone</th>
							{isAgent && <th>Business number</th>}
							{isAgent && <th>Cars</th>}
							<th>Warnings</th>
							<th>Status</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r._id}>
								<td>
									<div className="person">
										<div className={`avatar ${isAgent ? '' : 'user'}`}>{initial(r.company ?? r.nick)}</div>
										<div>
											<b>{r.company ?? r.nick}</b>
											<small>{isAgent ? `${r.nick}, ${r.city}` : r.city}</small>
										</div>
									</div>
								</td>
								<td className="num">{r.phone}</td>
								{isAgent && <td className="num">{r.businessNo || '—'}</td>}
								{isAgent && <td className="num">{r.cars}</td>}
								<td className="num" style={r.warnings >= 3 ? { color: 'var(--stop)', fontWeight: 700 } : undefined}>
									{r.warnings}
								</td>
								<td>
									<span className={`pill ${statusPill[r.status].cls}`}>{statusPill[r.status].label}</span>
								</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{r.status === MemberStatus.PENDING && <button className="btn dark sm">Review</button>}
										{r.status === MemberStatus.ACTIVE && <button className="btn danger sm">Block</button>}
										{r.status === MemberStatus.BLOCK && <button className="btn dark sm">Unblock</button>}
										{r.status !== MemberStatus.DELETE && r.status !== MemberStatus.PENDING && <button className="btn danger sm">Delete</button>}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pager page={page} total={1} onChange={setPage} />
		</>
	);
};

export default MemberList;
