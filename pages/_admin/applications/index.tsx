import React, { useState } from 'react';
import { NextPage } from 'next';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { initial, timeAgo } from '../../../libs/utils';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

// sample applications from the UI design (pending AGENT members, oldest first)
const applications = [
	{ _id: 'p1', company: 'KS Auto', nick: 'ksauto_77', businessNo: '101-09-55218', phone: '010-77•• ••50', applied: hoursAgo(26) },
	{ _id: 'p2', company: 'Mokdong Motors', nick: 'mokdongmotors', businessNo: '123-45-67890', phone: '010-23•• ••89', applied: hoursAgo(19) },
	{ _id: 'p3', company: 'Bupyeong Car Center', nick: 'bp_carcenter', businessNo: '214-81-33092', phone: '010-45•• ••12', applied: hoursAgo(12) },
	{ _id: 'p4', company: 'Jeju Island Rent', nick: 'jejurent', businessNo: '', phone: '010-61•• ••57', applied: hoursAgo(3) },
];

/** time left of the 24-hour promise: green, amber, then red when late */
const timer = (applied: Date) => {
	const left = 24 - Math.floor((Date.now() - applied.getTime()) / 3600000);
	if (left < 0) return { cls: 'late', text: `${-left} h late` };
	return { cls: left <= 6 ? 'warn' : 'ok', text: `${left} h` };
};

const Applications: NextPage = () => {
	const [selectedId, setSelectedId] = useState(applications[0]._id);
	const [reason, setReason] = useState('');
	const selected = applications.find((a) => a._id === selectedId) ?? applications[0];
	const reasonOk = reason.trim().length >= 5 && reason.length <= 300;

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Dealer applications</h1>
					<p>We promise an answer within 24 hours. Oldest first.</p>
				</div>
			</div>
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
								const t = timer(a.applied);
								const on = a._id === selected._id;
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
												<div className="avatar">{initial(a.company)}</div>
												<div>
													<b>{a.company}</b>
													<small>{a.nick}</small>
												</div>
											</div>
										</td>
										<td className="num">{a.businessNo || '—'}</td>
										<td>{timeAgo(a.applied)}</td>
										<td>
											<span className={`timer ${t.cls}`}>{t.text}</span>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				<div className="appdetail">
					<h2>{selected.company}</h2>
					<div style={{ color: 'var(--muted)', fontSize: 14 }}>
						Applied {timeAgo(selected.applied)} by {selected.nick}
					</div>
					<div className="check-row">
						<div>
							Business number<small>Optional at signup for now</small>
						</div>
						<span className="okmark">{selected.businessNo || 'Not given'}</span>
					</div>
					<div className="check-row">
						<div>
							Login phone<small>Verified by SMS at signup</small>
						</div>
						<span className="okmark">{selected.phone}</span>
					</div>
					<textarea
						className="field reason"
						placeholder="Reason for declining (sent to the applicant, 5 to 300 characters)"
						maxLength={300}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
						<button className="btn danger" disabled={!reasonOk}>
							Decline
						</button>
						<button className="btn good">Approve dealer</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default withLayoutAdmin(Applications);
