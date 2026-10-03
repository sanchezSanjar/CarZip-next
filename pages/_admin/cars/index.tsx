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
import { dealerName } from '../../../libs/utils';
import { withTranslations } from '../../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../../libs/hooks/useLocaleFormat';

const LIMIT = 10;

const statusPill: Record<CarStatus, { cls: string; label: string }> = {
	[CarStatus.ACTIVE]: { cls: 'active', label: 'dealers.tabCars' },
	[CarStatus.HOLD]: { cls: 'hold', label: 'mc.onHold' },
	[CarStatus.SOLD]: { cls: 'sold', label: 'car.sold' },
	[CarStatus.DELETE]: { cls: 'rej', label: 'mc.deleted' },
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
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
		const reason = await sweetPromptAlert(t('adm.holdCarQ', { title: c.carTitle }), t('adm.reasonShort'));
		if (reason) await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.HOLD, carHoldReason: reason } } }), t('adm.carHeld'));
	};
	const release = async (c: Car) => {
		if (await sweetConfirmAlert(t('adm.releaseQ', { title: c.carTitle }), t('adm.release')))
			await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.ACTIVE } } }), t('adm.carReleased'));
	};
	const remove = async (c: Car) => {
		if (await sweetConfirmAlert(t('adm.deleteCarQ', { title: c.carTitle }), t('my.delete'), true))
			await run(() => updateCar({ variables: { input: { _id: c._id, carStatus: CarStatus.DELETE } } }), t('adm.carDeleted'));
	};
	const removeForGood = async (c: Car) => {
		if (await sweetConfirmAlert(t('adm.removeCarQ', { title: c.carTitle }), t('adm.removeForGood'), true))
			await run(() => removeCar({ variables: { input: c._id } }), t('adm.removed'));
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{t('nt.cars')}</h1>
					<p>{t('adm.carsSub')}</p>
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
							{s ? t(statusPill[s].label) : t('board.all')} <TabCount carStatus={s} />
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
					<option value="">{t('search.allKorea')}</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{t(`enum.${l}`)}
						</option>
					))}
				</select>
			</div>
			<div className="block" style={{ opacity: loading && cars.length ? 0.6 : 1 }}>
				<table>
					<thead>
						<tr>
							<th>{t('my.car')}</th>
							<th>{t('board.dealer')}</th>
							<th>{t('mc.price')}</th>
							<th>{t('my.status')}</th>
							<th>{t('mc.views')}</th>
							<th>{t('menu.comments')}</th>
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
											<small>{c.carHoldReason
												? t('adm.held', { reason: c.carHoldReason })
												: t('adm.carMeta', { city: t(`enum.${c.carLocation}`), time: fmt.timeAgo(c.createdAt) })}</small>
										</div>
									</div>
								</td>
								<td>
									<Link href={`/agent/detail?id=${c.memberId}`} style={{ color: 'inherit' }}>
										{dealerName(c.agentData)}
									</Link>
								</td>
								<td className="num" style={{ fontWeight: 700 }}>
									{fmt.carPrice(c)}
								</td>
								<td>
									<span className={`pill ${statusPill[c.carStatus].cls}`}>{c.carHoldReason ? t('mc.heldByAdmin') : t(statusPill[c.carStatus].label)}</span>
								</td>
								<td className="num">{fmt.number(c.carViews)}</td>
								<td className="num">{c.carComments}</td>
								<td>
									<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
										{c.carStatus === CarStatus.ACTIVE && (
											<button className="btn ghost sm" onClick={() => hold(c)}>
												{t('mc.hold')}
											</button>
										)}
										{c.carStatus === CarStatus.HOLD && (
											<button className="btn dark sm" onClick={() => release(c)}>
												{t('adm.release')}
											</button>
										)}
										{c.carStatus !== CarStatus.DELETE && (
											<button className="btn danger sm" onClick={() => remove(c)}>
												{t('my.delete')}
											</button>
										)}
										{c.carStatus === CarStatus.DELETE && (
											<button className="btn danger sm" onClick={() => removeForGood(c)}>
												{t('adm.removeForGood')}
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
						<h3>{t('mc.noneHere')}</h3>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutAdmin(AdminCars);
