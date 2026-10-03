import React from 'react';
import { initial, timeAgo } from '../../utils';

const ago = (h: number) => new Date(Date.now() - h * 3600000);

// sample rows from the UI design
const blocks = [
	{ _id: 'b1', nick: 'car_hunter88', dealer: false, since: ago(3) },
	{ _id: 'b2', nick: 'Pyeongtaek Auto', dealer: true, since: ago(24 * 14) },
	{ _id: 'b3', nick: 'rider_kim', dealer: false, since: ago(24 * 30) },
];

/** dealer: people blocked from interacting with own cars, articles and profile. Nobody is notified */
const MyBlocks = () => {
	return (
		<>
			<div className="main-head">
				<div>
					<h1>Blocked people</h1>
					<p>People you blocked can still see your cars and contacts, but can&apos;t interact with them.</p>
				</div>
			</div>
			<div className="twocol" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
				<div className="block" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							Blocked<span>{blocks.length}</span>
						</h2>
					</div>
					{blocks.length ? (
						<table>
							<thead>
								<tr>
									<th>Person</th>
									<th>Blocked</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{blocks.map((b) => (
									<tr key={b._id}>
										<td>
											<div className="person">
												<div className={`avatar ${b.dealer ? '' : 'user'}`}>{initial(b.nick)}</div>
												<div>
													<b>{b.nick}</b>
													<small>{b.dealer ? 'Dealer' : 'Buyer'}</small>
												</div>
											</div>
										</td>
										<td>{timeAgo(b.since)}</td>
										<td>
											<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
												<button className="btn ghost sm">Unblock</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className="empty" style={{ margin: 18 }}>
							<h3>You haven&apos;t blocked anyone</h3>
							<p>If someone is bothering you, block them from their comment or profile.</p>
						</div>
					)}
				</div>
				<div className="sidecard">
					<h3>What blocking does</h3>
					<ul className="card-side" style={{ border: 0, padding: 0, margin: 0 }}>
						<li>They can&apos;t comment on your cars or articles</li>
						<li>They can&apos;t like your cars</li>
						<li>They can&apos;t follow you or request test drives from you</li>
						<li>They can still see your cars and contact details</li>
						<li className="x">It is not a CarZip-wide ban. Report serious abuse to admins.</li>
					</ul>
				</div>
			</div>
		</>
	);
};

export default MyBlocks;
