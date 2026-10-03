import React, { useState } from 'react';
import Link from 'next/link';
import { sampleCars } from '../../sampleData';
import { CarStatus } from '../../enums/car.enum';
import { formatCarPrice, formatNumber } from '../../utils';
import CarPhoto from '../common/CarPhoto';
import Pager from '../common/Pager';

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'For sale' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'On hold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'Sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'Deleted' },
};

const tabs = [
	{ status: '', label: 'All' },
	{ status: CarStatus.ACTIVE, label: 'For sale' },
	{ status: CarStatus.HOLD, label: 'On hold' },
	{ status: CarStatus.SOLD, label: 'Sold' },
];

// sample: a few of the design's cars in different states
const myCars = sampleCars.slice(0, 6).map((c, i) => ({
	...c,
	carStatus: i === 3 ? CarStatus.HOLD : i === 5 ? CarStatus.SOLD : CarStatus.ACTIVE,
}));

/** dealer: every own car in any status, with the actions each status allows */
const MyCars = () => {
	const [status, setStatus] = useState<CarStatus | ''>('');
	const [page, setPage] = useState(1);
	const cars = myCars.filter((c) => !status || c.carStatus === status);

	const deals = (c: (typeof myCars)[number]) =>
		['Sale', c.carRent && 'rent', c.carBarter && 'barter'].filter(Boolean).join(', ');

	return (
		<>
			<div className="main-head">
				<div>
					<h1>My cars</h1>
					<p>Buyers only see cars that are for sale.</p>
				</div>
				<Link href="/mypage?category=addCar" className="btn primary">
					List a car
				</Link>
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					{tabs.map((t) => (
						<span key={t.label} className={`chip ${status === t.status ? 'on' : ''}`} onClick={() => setStatus(t.status as CarStatus | '')}>
							{t.label}{' '}
							<span className="num">{myCars.filter((c) => !t.status || c.carStatus === t.status).length}</span>
						</span>
					))}
				</div>
				<div className="grow" />
				<select className="field" style={{ width: 190, fontWeight: 600 }}>
					<option value="CREATED_AT">Newest</option>
					<option value="VIEWS">Most viewed</option>
					<option value="LIKES">Most liked</option>
				</select>
			</div>
			<div className="block">
				<table>
					<thead>
						<tr>
							<th>Car</th>
							<th>Price</th>
							<th>Deal</th>
							<th>Status</th>
							<th>Views</th>
							<th>Likes</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{cars.map((c) => (
							<tr key={c._id}>
								<td>
									<div className="carcell">
										<CarPhoto image={c.carImages[0]} type={c.carType} color={c.carColor} className="thumb" />
										<div>
											<b>{c.carTitle}</b>
											<small>
												{c.carYear}, {formatNumber(c.carMileage)} km
											</small>
										</div>
									</div>
								</td>
								<td className="num" style={{ fontWeight: 700 }}>
									{formatCarPrice(c)}
								</td>
								<td>{deals(c)}</td>
								<td>
									<span className={`pill ${statusPill[c.carStatus].cls}`}>{statusPill[c.carStatus].label}</span>
								</td>
								<td className="num">{formatNumber(c.carViews)}</td>
								<td className="num">{c.carLikes}</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{c.carStatus === CarStatus.ACTIVE && (
											<>
												<button className="btn ghost sm">Edit</button>
												<button className="btn ghost sm">Mark as sold</button>
												<button className="btn ghost sm">Hold</button>
											</>
										)}
										{c.carStatus === CarStatus.HOLD && <button className="btn dark sm">Put back on sale</button>}
										{c.carStatus === CarStatus.SOLD && (
											<Link href={`/car/detail?id=${c._id}`} className="btn ghost sm">
												View
											</Link>
										)}
										{c.carStatus !== CarStatus.SOLD && <button className="btn danger sm">Delete</button>}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!cars.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No cars here</h3>
						<p>Cars you list show up in this table.</p>
						<Link href="/mypage?category=addCar" className="btn ghost">
							List a car
						</Link>
					</div>
				)}
			</div>
			<Pager page={page} total={1} onChange={setPage} />
		</>
	);
};

export default MyCars;
