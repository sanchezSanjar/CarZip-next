import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_FAVORITES, GET_VISITED } from '../../../apollo/user/query';
import { CarsPage } from '../../types/car/car';
import { CarStatus } from '../../enums/car.enum';
import { useLikeCar } from '../../hooks/useLikeCar';
import CarCard from '../common/CarCard';
import Pager from '../common/Pager';
import { useTranslation } from 'next-i18next/pages';

const LIMIT = 9;

/** cars I liked (favorites) or opened (recently viewed). Only cars for sale or sold are shown */
const MyFavorites = ({ visited = false }: { visited?: boolean }) => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [status, setStatus] = useState<CarStatus | ''>('');
	const [page, setPage] = useState(1);
	const like = useLikeCar();

	/** APOLLO REQUESTS **/
	const { data, loading, refetch } = useQuery<{ getFavorites?: CarsPage; getVisited?: CarsPage }>(visited ? GET_VISITED : GET_FAVORITES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT } },
		notifyOnNetworkStatusChange: true,
	});
	const result = visited ? data?.getVisited : data?.getFavorites;
	const all = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	// the API has no status filter here, so the tabs filter the current page
	const cars = all.filter((c) => !status || c.carStatus === status);

	/** HANDLERS **/
	const likeCarHandler = async (carId: string) => {
		await like(carId);
		if (!visited) await refetch(); // un-liked cars leave the favourites
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{visited ? t('menu.recent') : t('menu.favorites')}</h1>
					<p>{visited ? t('fav.recentSub') : t('fav.sub')}</p>
				</div>
			</div>
			<div className="fav-top">
				<div className="chips">
					{[
						{ s: '', l: 'board.all' },
						{ s: CarStatus.ACTIVE, l: 'dealers.tabCars' },
						{ s: CarStatus.SOLD, l: 'car.sold' },
					].map((tab) => (
						<span key={tab.l} className={`chip ${status === tab.s ? 'on' : ''}`} onClick={() => setStatus(tab.s as CarStatus | '')}>
							{t(tab.l)} <span className="num">{tab.s ? all.filter((c) => c.carStatus === tab.s).length : total}</span>
						</span>
					))}
				</div>
			</div>
			{cars.length ? (
				<div className="grid3" style={{ opacity: loading ? 0.6 : 1 }}>
					{cars.map((car) => (
						<CarCard key={car._id} car={car} mine={car.memberId === user._id} likeCarHandler={likeCarHandler} />
					))}
				</div>
			) : (
				!loading && (
					<div className="empty">
						<h3>{visited ? t('fav.noneSeen') : t('fav.noneFav')}</h3>
						<p>{visited ? t('fav.noneSeenText') : t('fav.noneFavText')}</p>
						<Link href="/car" className="btn ghost">
							{t('detail.browseCars')}
						</Link>
					</div>
				)
			)}
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyFavorites;
