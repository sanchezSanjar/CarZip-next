import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import CarPhoto from '../../../libs/components/common/CarPhoto';
import Pager from '../../../libs/components/common/Pager';
import { GET_ALL_CARS_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_CAR_BY_ADMIN, UPDATE_CAR_BY_ADMIN } from '../../../apollo/admin/mutation';
import { CarLocation, CarStatus } from '../../../libs/enums/car.enum';
import { Car, CarsPage } from '../../../libs/types/car/car';
import { getErrorMessage } from '../../../libs/auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetPromptAlert, sweetTopSuccessAlert } from '../../../libs/sweetAlert';
import { dealerName, enumLabel, formatCarPrice, formatNumber, timeAgo } from '../../../libs/utils';
import { withTranslations } from '../../../libs/i18n';

const LIMIT = 10;

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'For sale' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'On hold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'Sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'Deleted' },
};

/** how many cars a tab has: a one-row query that only reads the total */
const TabCount = ({ carStatus }: { carStatus?: CarStatus }) => {
	const { data } = useQuery<{ getAllCarsByAdmin: CarsPage }>(GET_ALL_CARS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, ...(carStatus ? { search: { carStatus } } : {}) } },
	});
	return <span className="num">{data?.getAllCarsByAdmin.metaCounter?.[0]?.total ?? 0}</span>;
};

/**
 * Admin: every car in any status. HOLD needs a reason (the dealer is notified and can't re-list it),
 * ACTIVE releases it, and only a car already deleted can be removed for good (with its likes, comments and test drives).
 */
const AdminCars: NextPage = () => {
	const [status, setStatus] = useState<CarStatus | undefined>();
	const [location, setLocation] = useState<CarLocation | ''>('');
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const search = { ...(status ? { carStatus: status } : {}), ...(location ? { locationList: [location] } : {}) };
	const { data, loading } = useQuery<{ getAllCarsByAdmin: CarsPage }>(GET_ALL_CARS_BY_ADMIN, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT, ...(Object.keys(search).length ? { search } : {}) } },
	});
	const [updateCar] = useMutation(UPDATE_CAR_BY_ADMIN, { refetchQueries: [GET_ALL_CARS_BY_ADMIN] });
	const [removeCar] = useMutation(REMOVE_CAR_BY_ADMIN, { refetchQueries: [GET_ALL_CARS_BY_ADMIN] });
	const cars = data?.getAllCarsByAdmin.list ?? [];
	const total = data?.getAllCarsByAdmin.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const run = async (task: () => Promise<unknown>, done: string) => {
		try {
			await task();
			await sweetTopSuccessAlert(done, 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const hold = async (c: Car) => {
		const reason = await sweetPromptAlert(`Put "${c.carTitle}" on hold? The dealer sees your reason and can't put it back on sale.`, 'Reason (5 to 300 characters)');
		if (reason) await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.HOLD, carHoldReason: reason } } }), 'Car put on hold');
	};
	const release = async (c: Car) => {
		if (await sweetConfirmAlert(`Put "${c.carTitle}" back on sale? The dealer is notified.`, 'Release'))
			await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.ACTIVE } } }), 'Car released');
	};
	const remove = async (c: Car) => {
		if (await sweetConfirmAlert(`Delete "${c.carTitle}"? Its open test drives are cancelled and the dealer is notified.`, 'Delete', true))
			await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.DELETE } } }), 'Car deleted');
	};
	const removeForGood = async (c: Car) => {
		if (await sweetConfirmAlert(`Remove "${c.carTitle}" for good? Its likes, comments, views, test drives and notifications are removed too. This can't be undone.`, 'Remove for good', true))
			await run(() => removeCar({ variables: { input: c._id } }), 'Removed');
	};

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
					{[undefined, ...Object.values(CarStatus)].map((s) => (
						<span
							key={s ?? 'all'}
							className={`chip ${status === s ? 'on' : ''}`}
							onClick={() => {
								setStatus(s);
								setPage(1);
							}}
						>
							{s ? statusPill[s].label : 'All'} <TabCount carStatus={s} />
						</span>
					))}
				</div>
				<div className="grow" />
				<select
					className="field"
					style={{ width: 190 }}
					value={location}
					onChange={(e) => {
						setLocation(e.target.value as CarLocation | '');
						setPage(1);
					}}
				>
					<option value="">All of Korea</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{enumLabel(l)}
						</option>
					))}
				</select>
			</div>
			<div className="block" style={{ opacity: loading && cars.length ? 0.6 : 1 }}>
				<table>
					<thead>
						<tr>
							<th>Car</th>
							<th>Dealer</th>
							<th>Price</th>
							<th>Status</th>
							<th>Views</th>
							<th>Comments</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{cars.map((c) => (
							<tr key={c._id}>
								<td>
									<div className="carcell">
										<CarPhoto image={c.carImages[0]} className="thumb" />
										<div>
											{c.carStatus === CarStatus.DELETE ? (
												<b>{c.carTitle}</b>
											) : (
												<Link href={`/car/detail?id=${c._id}`} style={{ color: 'inherit' }}>
													<b>{c.carTitle}</b>
												</Link>
											)}
											<small>{c.carHoldReason ? `Held: ${c.carHoldReason}` : `${enumLabel(c.carLocation)} · listed ${timeAgo(c.createdAt)}`}</small>
										</div>
									</div>
								</td>
								<td>
									<Link href={`/agent/detail?id=${c.memberId}`} style={{ color: 'inherit' }}>
										{dealerName(c.agentData)}
									</Link>
								</td>
								<td className="num" style={{ fontWeight: 700 }}>
									{formatCarPrice(c)}
								</td>
								<td>
									<span className={`pill ${statusPill[c.carStatus].cls}`}>{c.carHoldReason ? 'Held by admin' : statusPill[c.carStatus].label}</span>
								</td>
								<td className="num">{formatNumber(c.carViews)}</td>
								<td className="num">{c.carComments}</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{c.carStatus === CarStatus.ACTIVE && (
											<button className="btn ghost sm" onClick={() => hold(c)}>
												Hold
											</button>
										)}
										{c.carStatus === CarStatus.HOLD && (
											<button className="btn dark sm" onClick={() => release(c)}>
												Release
											</button>
										)}
										{c.carStatus !== CarStatus.DELETE && (
											<button className="btn danger sm" onClick={() => remove(c)}>
												Delete
											</button>
										)}
										{c.carStatus === CarStatus.DELETE && (
											<button className="btn danger sm" onClick={() => removeForGood(c)}>
												Remove for good
											</button>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{!loading && !cars.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No cars here</h3>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutAdmin(AdminCars);
