import React, { useState } from 'react';
import { CarColor, CarType } from '../../enums/car.enum';
import { initial, timeAgo } from '../../utils';
import CarPhoto from '../common/CarPhoto';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

// sample rows from the UI design
const comments = [
	{ _id: 'm1', nick: 'hyejin_k', dealer: false, text: 'Is the sunroof original or aftermarket? And is the powertrain warranty still valid?', when: hoursAgo(48), car: 'Kia Sorento 2.2 Diesel', type: CarType.SUV, color: CarColor.WHITE },
	{ _id: 'm2', nick: 'Gangnam Premium', dealer: true, text: 'Nice spec for this mileage. Price looks fair for the market right now.', when: hoursAgo(24), car: 'Kia Sorento 2.2 Diesel', type: CarType.SUV, color: CarColor.WHITE },
	{ _id: 'm3', nick: 'car_hunter88', dealer: false, text: "Same car is 400만원 cheaper at another lot. Don't buy here.", when: hoursAgo(3), car: 'Tesla Model 3', type: CarType.SEDAN, color: CarColor.RED },
	{ _id: 'm4', nick: 'dongwoo', dealer: false, text: 'Can the test drive be on Sunday instead?', when: hoursAgo(5), car: 'Tesla Model 3', type: CarType.SEDAN, color: CarColor.RED },
];

const tabs = [
	{ key: 'cars', label: 'On my cars' },
	{ key: 'articles', label: 'On my articles' },
];

/** dealer: comments on own cars and articles. Only admins can delete a comment; the dealer can block the writer */
const MyComments = () => {
	const [tab, setTab] = useState('cars');
	const rows = tab === 'cars' ? comments : [];

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Comments</h1>
					<p>Comments on your cars and articles. Only CarZip admins can remove a comment.</p>
				</div>
			</div>
			<div className="banner info" style={{ marginBottom: 18 }}>
				<span className="i">i</span>
				<div>
					<b>Someone is causing trouble?</b>Block them to stop them commenting, liking or booking test drives on your cars. It
					doesn&apos;t affect the rest of CarZip.
				</div>
			</div>
			<div className="block">
				<div className="block-head">
					<div className="tabs2">
						{tabs.map((t) => (
							<span key={t.key} className={`chip ${tab === t.key ? 'on' : ''}`} onClick={() => setTab(t.key)}>
								{t.label}
							</span>
						))}
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>From</th>
							<th>Comment</th>
							<th>On</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.map((c) => (
							<tr key={c._id} className="cm-row">
								<td>
									<div className="person">
										<div className={`avatar ${c.dealer ? '' : 'user'}`}>{initial(c.nick)}</div>
										<div>
											<b>{c.nick}</b>
											<small>{c.dealer ? 'Dealer' : 'Buyer'}</small>
										</div>
									</div>
								</td>
								<td>
									<div className="quote">
										{c.text}
										<small>{timeAgo(c.when)}</small>
									</div>
								</td>
								<td>
									<div className="carcell">
										<CarPhoto type={c.type} color={c.color} className="thumb" />
										<div>
											<b>{c.car}</b>
										</div>
									</div>
								</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										<button className="btn dark sm">Reply</button>
										<button className="btn danger sm">Block</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No comments yet</h3>
						<p>Comments people write here show up in this list.</p>
					</div>
				)}
			</div>
		</>
	);
};

export default MyComments;
