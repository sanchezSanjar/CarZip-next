import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_AGENT_CARS } from '../../../apollo/user/query';
import { CONFIRM_CAR_LISTING, UPDATE_CAR } from '../../../apollo/user/mutation';
import { CarStatus } from '../../enums/car.enum';
import { CarsPage } from '../../types/car/car';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import CarPhoto from '../common/CarPhoto';
import Pager from '../common/Pager';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const LIMIT = 10;
const STALE_DAYS = 30; // the backend asks "still for sale?" after 30 days without an edit or confirmation

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'dealers.tabCars' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'mc.onHold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'car.sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'mc.deleted' },
};
const tabs: { status?: CarStatus; label: string }[] = [
	{ label: 'board.all' },
	{ status: CarStatus.ACTIVE, label: 'dealers.tabCars' },
	{ status: CarStatus.HOLD, label: 'mc.onHold' },
	{ status: CarStatus.SOLD, label: 'car.sold' },
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
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
			[CarStatus.SOLD]: [t('mc.soldQ', { title }), t('mc.markSold')],
			[CarStatus.HOLD]: [t('mc.holdQ', { title }), t('mc.pause')],
			[CarStatus.DELETE]: [t('mc.deleteQ', { title }), t('my.delete')],
		};
		const q = questions[next];
		if (q && !(await sweetConfirmAlert(q[0], q[1], next === CarStatus.DELETE))) return;
		try {
			await updateCar({ variables: { input: { _id: carId, carStatus: next } } });
			await sweetTopSuccessAlert(next === CarStatus.ACTIVE ? t('mc.backOnSale') : t('my.saved'), 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	const stillForSale = async (carId: string) => {
		try {
			await confirmCarListing({ variables: { input: carId } });
			await refetch();
			await sweetTopSuccessAlert(t('mc.confirmed'), 1200);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	const isStale = (lastTouched?: Date) => !!lastTouched && now - new Date(lastTouched).getTime() > STALE_DAYS * 86400000;
	const deals = (c: (typeof cars)[number]) => [t('mc.sale'), c.carRent && t('car.rent'), c.carBarter && t('car.barter')].filter(Boolean).join(', ');

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{t('menu.myCars')}</h1>
					<p>{t('mc.sub')}</p>
				</div>
				<Link href="/mypage?category=addCar" className="btn primary">
					{t('my.listCar')}
				</Link>
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					{tabs.map((tab, i) => (
						<span
							key={tab.label}
							className={`chip ${status === tab.status ? 'on' : ''}`}
							onClick={() => {
								setStatus(tab.status);
								setPage(1);
							}}
						>
							{t(tab.label)} <span className="num">{counts[i]}</span>
						</span>
					))}
				</div>
			</div>
			<div className="block" style={{ opacity: loading && cars.length ? 0.6 : 1 }}>
				<table>
					<thead>
						<tr>
							<th>{t('my.car')}</th>
							<th>{t('mc.price')}</th>
							<th>{t('mc.deal')}</th>
							<th>{t('my.status')}</th>
							<th>{t('mc.views')}</th>
							<th>{t('mc.likes')}</th>
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
												<small>{heldByAdmin
												? t('mc.heldBy', { reason: c.carHoldReason })
												: t('mc.meta', { year: c.carYear, km: fmt.number(c.carMileage), time: fmt.timeAgo(c.createdAt) })}</small>
											</div>
										</div>
									</td>
									<td className="num" style={{ fontWeight: 700 }}>
										{fmt.carPrice(c)}
									</td>
									<td>{deals(c)}</td>
									<td>
										<span className={`pill ${statusPill[c.carStatus].cls}`}>{heldByAdmin ? t('mc.heldByAdmin') : t(statusPill[c.carStatus].label)}</span>
									</td>
									<td className="num">{fmt.number(c.carViews)}</td>
									<td className="num">{c.carLikes}</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											{c.carStatus === CarStatus.ACTIVE && isStale(c.carConfirmedAt ?? c.updatedAt) && (
												<button className="btn good sm" onClick={() => stillForSale(c._id)}>
													{t('mc.stillForSale')}
												</button>
											)}
											{(c.carStatus === CarStatus.ACTIVE || c.carStatus === CarStatus.HOLD) && (
												<Link href={`/mypage?category=editCar&carId=${c._id}`} className="btn ghost sm">
													{t('my.edit')}
												</Link>
											)}
											{c.carStatus === CarStatus.ACTIVE && (
												<>
													<button className="btn ghost sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.SOLD)}>
														{t('mc.markSold')}
													</button>
													<button className="btn ghost sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.HOLD)}>
														{t('mc.hold')}
													</button>
												</>
											)}
											{c.carStatus === CarStatus.HOLD && !heldByAdmin && (
												<button className="btn dark sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.ACTIVE)}>
													{t('mc.putBack')}
												</button>
											)}
											{c.carStatus !== CarStatus.SOLD && (
												<button className="btn danger sm" onClick={() => changeStatus(c._id, c.carTitle, CarStatus.DELETE)}>
													{t('my.delete')}
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
						<h3>{status ? t('mc.noneHere') : t('mc.noneYet')}</h3>
						<p>{t('mc.noneText')}</p>
						<Link href="/mypage?category=addCar" className="btn ghost">
							{t('my.listCar')}
						</Link>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyCars;
