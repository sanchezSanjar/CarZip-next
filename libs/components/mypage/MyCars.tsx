import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_AGENT_CARS } from '../../../apollo/user/query';
import { CONFIRM_CAR_LISTING, UPDATE_CAR } from '../../../apollo/user/mutation';
import { CarStatus } from '../../enums/car.enum';
import { CarsPage } from '../../types/car/car';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { formatCarPrice, formatNumber, timeAgo } from '../../utils';
import CarPhoto from '../common/CarPhoto';
import Pager from '../common/Pager';

const LIMIT = 10;
const STALE_DAYS = 30; // the backend asks "still for sale?" after 30 days without an edit or confirmation

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'For sale' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'On hold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'Sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'Deleted' },
};
const tabs: { status?: CarStatus; label: string }[] = [
	{ label: 'All' },
	{ status: CarStatus.ACTIVE, label: 'For sale' },
	{ status: CarStatus.HOLD, label: 'On hold' },
	{ status: CarStatus.SOLD, label: 'Sold' },
];

/** how many cars a tab has: a one-row query that only reads the total */
const useTabCount = (status?: CarStatus) => {
	const { data } = useQuery<{ getAgentCars: CarsPage }>(GET_AGENT_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, ...(status ? { search: { carStatus: status } } : {}) } },
	});
	return data?.getAgentCars.metaCounter?.[0]?.total ?? 0;
};

/** dealer: own cars in any status (deleted ones are gone), with the actions each status allows */
const MyCars = () => {
	const [status, setStatus] = useState<CarStatus | undefined>();
	const [page, setPage] = useState(1);
	const [now] = useState(() => Date.now()); // read the clock once, not on every redraw
	const counts = [useTabCount(), useTabCount(CarStatus.ACTIVE), useTabCount(CarStatus.HOLD), useTabCount(CarStatus.SOLD)];

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery<{ getAgentCars: CarsPage }>(GET_AGENT_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT, ...(status ? { search: { carStatus: status } } : {}) } },
		notifyOnNetworkStatusChange: true,
	});
	const [updateCar] = useMutation(UPDATE_CAR, { refetchQueries: [GET_AGENT_CARS] });
	const [confirmCarListing] = useMutation(CONFIRM_CAR_LISTING);
	const cars = data?.getAgentCars.list ?? [];
	const total = data?.getAgentCars.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const changeStatus = async (carId: string, title: string, next: CarStatus) => {
		const questions: Partial<Record<CarStatus, [string, string]>> = {
			[CarStatus.SOLD]: [`Mark "${title}" as sold? It leaves the search, open test drives are cancelled and the buyers are notified. This can't be undone.`, 'Mark as sold'],
			[CarStatus.HOLD]: [`Pause "${title}"? It is hidden from search and open test drives are cancelled.`, 'Pause listing'],
			[CarStatus.DELETE]: [`Delete "${title}"? Open test drives are cancelled. This can't be undone.`, 'Delete'],
		};
		const q = questions[next];
		if (q && !(await sweetConfirmAlert(q[0], q[1], next === CarStatus.DELETE))) return;
		try {
			await updateCar({ variables: { input: { _id: carId, carStatus: next } } });
			await sweetTopSuccessAlert(next === CarStatus.ACTIVE ? 'Back on sale' : 'Saved', 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	const stillForSale = async (carId: string) => {
		try {
			await confirmCarListing({ variables: { input: carId } });
			await refetch();
			await sweetTopSuccessAlert('Thanks, the listing is confirmed', 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	const isStale = (lastTouched?: Date) => !!lastTouched && now - new Date(lastTouched).getTime() > STALE_DAYS * 86400000;
	const deals = (c: (typeof cars)[number]) => ['Sale', c.carRent && 'rent', c.carBarter && 'barter'].filter(Boolean).join(', ');

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
					{tabs.map((t, i) => (
						<span
							key={t.label}
							className={`chip ${status === t.status ? 'on' : ''}`}
							onClick={() => {
								setStatus(t.status);
								setPage(1);
							}}
						>
							{t.label} <span className="num">{counts[i]}</span>
						</span>
					))}
				</div>
			</div>
			<div className="block" style={{ opacity: loading && cars.length ? 0.6 : 1 }}>
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
						{cars.map((c) => {
							const heldByAdmin = c.carStatus === CarStatus.HOLD && !!c.carHoldReason;
							return (
								<tr key={c._id}>
									<td>
										<div className="carcell">
											<CarPhoto image={c.carImages[0]} type={c.carType} color={c.carColor} className="thumb" />
											<div>
												<Link href={`/car/detail?id=${c._id}`} style={{ color: 'inherit' }}>
													<b>{c.carTitle}</b>
												</Link>
												<small>{heldByAdmin ? `Held by admin: ${c.carHoldReason}` : `${c.carYear}, ${formatNumber(c.carMileage)} km · listed ${timeAgo(c.createdAt)}`}</small>
											</div>
										</div>
									</td>
									<td className="num" style={{ fontWeight: 700 }}>
										{formatCarPrice(c)}
									</td>
									<td>{deals(c)}</td>
									<td>
										<span className={`pill ${statusPill[c.carStatus].cls}`}>{heldByAdmin ? 'Held by admin' : statusPill[c.carStatus].label}</span>
									</td>
									<td className="num">{formatNumber(c.carViews)}</td>
									<td className="num">{c.carLikes}</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											{c.carStatus === CarStatus.ACTIVE && isStale(c.carConfirmedAt ?? c.updatedAt) && (
												<button className="btn good sm" onClick={() => stillForSale(c._id)}>
													Still for sale
												</button>
											)}
											{c.carStatus === CarStatus.ACTIVE && (
												<>
													<button className="btn ghost sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.SOLD)}>
														Mark as sold
													</button>
													<button className="btn ghost sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.HOLD)}>
														Hold
													</button>
												</>
											)}
											{c.carStatus === CarStatus.HOLD && !heldByAdmin && (
												<button className="btn dark sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.ACTIVE)}>
													Put back on sale
												</button>
											)}
											{c.carStatus !== CarStatus.SOLD && (
												<button className="btn danger sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.DELETE)}>
													Delete
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				{!loading && !cars.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>{status ? 'No cars here' : 'You have no cars yet'}</h3>
						<p>Cars you list show up in this table.</p>
						<Link href="/mypage?category=addCar" className="btn ghost">
							List a car
						</Link>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyCars;
