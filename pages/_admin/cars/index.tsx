import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import CarPhoto from '../../../libs/components/common/CarPhoto';
import Pager from '../../../libs/components/common/Pager';
import { sampleCars } from '../../../libs/sampleData';
import { CarStatus } from '../../../libs/enums/car.enum';
import { dealerName, formatCarPrice, formatNumber } from '../../../libs/utils';

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'For sale' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'On hold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'Sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'Deleted' },
};

// sample: the design's cars in different states, one held by an admin
const cars = sampleCars.slice(0, 6).map((c, i) => ({
	...c,
	carStatus: i === 2 ? CarStatus.HOLD : i === 4 ? CarStatus.SOLD : i === 5 ? CarStatus.DELETE : CarStatus.ACTIVE,
	carHoldReason: i === 2 ? 'Price far below similar cars, checking with the dealer' : undefined,
}));

/**
 * admin: every car. HOLD needs a reason (the dealer is notified), ACTIVE restores,
 * and only a car already in DELETE can be removed for good (with its likes, comments and test drives).
 */
const AdminCars: NextPage = () => {
	const [status, setStatus] = useState<CarStatus | ''>('');
	const [page, setPage] = useState(1);
	const rows = cars.filter((c) => !status || c.carStatus === status);

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Cars</h1>
					<p>Putting a car on hold needs a reason; the dealer gets a notification.</p>
				</div>
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					<span className={`chip ${status === '' ? 'on' : ''}`} onClick={() => setStatus('')}>
						All
					</span>
					{Object.values(CarStatus).map((s) => (
						<span key={s} className={`chip ${status === s ? 'on' : ''}`} onClick={() => setStatus(s)}>
							{statusPill[s].label}
						</span>
					))}
				</div>
				<div className="grow" />
				<input className="field" style={{ width: 260 }} placeholder="Search car or dealer" />
			</div>
			<div className="block">
				<table>
					<thead>
						<tr>
							<th>Car</th>
							<th>Dealer</th>
							<th>Price</th>
							<th>Status</th>
							<th>Views</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.map((c) => (
							<tr key={c._id}>
								<td>
									<div className="carcell">
										<CarPhoto image={c.carImages[0]} type={c.carType} color={c.carColor} className="thumb" />
										<div>
											<b>{c.carTitle}</b>
											<small>{c.carHoldReason ?? `${c.carYear}, ${formatNumber(c.carMileage)} km`}</small>
										</div>
									</div>
								</td>
								<td>{dealerName(c.agentData)}</td>
								<td className="num" style={{ fontWeight: 700 }}>
									{formatCarPrice(c)}
								</td>
								<td>
									<span className={`pill ${statusPill[c.carStatus].cls}`}>
										{c.carHoldReason ? 'On hold by admin' : statusPill[c.carStatus].label}
									</span>
								</td>
								<td className="num">{formatNumber(c.carViews)}</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										<Link href={`/car/detail?id=${c._id}`} className="btn ghost sm">
											View
										</Link>
										{c.carStatus === CarStatus.ACTIVE && <button className="btn ghost sm">Hold</button>}
										{c.carStatus === CarStatus.HOLD && <button className="btn dark sm">Release</button>}
										{c.carStatus !== CarStatus.DELETE && c.carStatus !== CarStatus.SOLD && <button className="btn danger sm">Delete</button>}
										{c.carStatus === CarStatus.DELETE && <button className="btn danger sm">Remove for good</button>}
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

export default withLayoutAdmin(AdminCars);
