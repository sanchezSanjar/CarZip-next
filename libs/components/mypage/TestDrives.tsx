import React, { useState } from 'react';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { TestDriveStatus } from '../../enums/test-drive.enum';
import { CarColor, CarType } from '../../enums/car.enum';
import { formatDateTime, initial, timeAgo } from '../../utils';
import CarPhoto from '../common/CarPhoto';

const daysFromNow = (d: number, h = 10) => {
	const date = new Date(Date.now() + d * 86400000);
	date.setHours(h, 30, 0, 0);
	return date;
};

// sample rows from the UI design
const sampleRequests = [
	{ _id: 't1', nick: 'hyejin_k', asked: daysFromNow(-2), date: daysFromNow(5), car: 'Kia Sorento 2.2 Diesel', type: CarType.SUV, color: CarColor.WHITE, message: 'Can I bring my own mechanic?', status: TestDriveStatus.REQUEST, phone: '' },
	{ _id: 't2', nick: 'dongwoo', asked: daysFromNow(-1), date: daysFromNow(2, 18), car: 'Tesla Model 3', type: CarType.SEDAN, color: CarColor.RED, message: 'After work, if possible.', status: TestDriveStatus.REQUEST, phone: '' },
	{ _id: 't3', nick: 'sora.lee', asked: daysFromNow(-0.2), date: daysFromNow(3, 11), car: 'Kia Sorento 2.2 Diesel', type: CarType.SUV, color: CarColor.WHITE, message: '', status: TestDriveStatus.CONFIRM, phone: '010-5812-3321' },
];

const statusPill: Record<TestDriveStatus, { cls: string; label: string }> = {
	[TestDriveStatus.REQUEST]: { cls: 'req', label: 'Waiting' },
	[TestDriveStatus.CONFIRM]: { cls: 'active', label: 'Confirmed' },
	[TestDriveStatus.REJECT]: { cls: 'rej', label: 'Declined' },
	[TestDriveStatus.CANCEL]: { cls: 'sold', label: 'Cancelled' },
	[TestDriveStatus.COMPLETE]: { cls: 'sold', label: 'Done' },
};

/**
 * Dealer: requests from buyers (confirm, decline, complete, cancel).
 * Buyer: my requests (cancel). The buyer's phone shows only after the dealer confirms.
 */
const TestDrives = () => {
	const user = useReactiveVar(userVar);
	const isAgent = user.memberType === MemberType.AGENT;
	const [filter, setFilter] = useState<TestDriveStatus | ''>('');
	const rows = sampleRequests.filter((r) => !filter || r.status === filter);
	const waiting = sampleRequests.filter((r) => r.status === TestDriveStatus.REQUEST).length;

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? 'Test drives' : 'My test drives'}</h1>
					<p>
						{isAgent
							? `${waiting} test drive requests are waiting for your answer.`
							: 'The dealer confirms or declines your request. You get a notification either way.'}
					</p>
				</div>
			</div>
			{isAgent && (
				<div className="kpis">
					<div className="kpi alert">
						<small>Waiting for your answer</small>
						<b>{waiting}</b>
					</div>
					<div className="kpi">
						<small>Confirmed</small>
						<b>{sampleRequests.filter((r) => r.status === TestDriveStatus.CONFIRM).length}</b>
					</div>
					<div className="kpi">
						<small>Cars for sale</small>
						<b>42</b>
					</div>
					<div className="kpi">
						<small>On hold</small>
						<b>3</b>
					</div>
				</div>
			)}
			<div className="block">
				<div className="block-head">
					<h2>{isAgent ? 'Requests' : 'Your requests'}</h2>
					<div className="chips">
						<span className={`chip ${filter === '' ? 'on' : ''}`} onClick={() => setFilter('')}>
							All
						</span>
						{[TestDriveStatus.REQUEST, TestDriveStatus.CONFIRM, TestDriveStatus.COMPLETE, TestDriveStatus.CANCEL].map((s) => (
							<span key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
								{statusPill[s].label}
							</span>
						))}
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>{isAgent ? 'Buyer' : 'Dealer'}</th>
							<th>Car</th>
							<th>Date</th>
							<th>Message</th>
							<th>Status</th>
							<th style={{ textAlign: 'right' }} />
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => (
							<tr key={r._id}>
								<td>
									<div className="person">
										<div className={`avatar ${isAgent ? 'user' : ''}`}>{initial(isAgent ? r.nick : 'Mokdong Motors')}</div>
										<div>
											<b>{isAgent ? r.nick : 'Mokdong Motors'}</b>
											<small>{isAgent && r.phone ? r.phone : `asked ${timeAgo(r.asked)}`}</small>
										</div>
									</div>
								</td>
								<td>
									<div className="carcell">
										<CarPhoto type={r.type} color={r.color} className="thumb" />
										<div>
											<b>{r.car}</b>
										</div>
									</div>
								</td>
								<td className="when">
									<b>{formatDateTime(r.date)}</b>
								</td>
								<td className="msg">{r.message || '—'}</td>
								<td>
									<span className={`pill ${statusPill[r.status].cls}`}>{statusPill[r.status].label}</span>
								</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{isAgent && r.status === TestDriveStatus.REQUEST && (
											<>
												<button className="btn good sm">Confirm</button>
												<button className="btn danger sm">Decline</button>
											</>
										)}
										{!isAgent && r.status === TestDriveStatus.REQUEST && <button className="btn danger sm">Cancel</button>}
										{r.status === TestDriveStatus.CONFIRM && <button className="btn danger sm">Cancel</button>}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No test drive requests</h3>
						<p>
							{isAgent
								? 'Requests from buyers show up here. Cars with test drives turned on get more of them.'
								: 'Open a car with test drives and pick a date to send a request.'}
						</p>
					</div>
				)}
			</div>
		</>
	);
};

export default TestDrives;
