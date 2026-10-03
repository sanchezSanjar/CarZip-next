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

const LIMIT = 9;

/** cars I liked (favorites) or opened (recently viewed). Only cars for sale or sold are shown */
const MyFavorites = ({ visited = false }: { visited?: boolean }) => {
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
					<h1>{visited ? 'Recently viewed' : 'My favourites'}</h1>
					<p>{visited ? 'Cars you opened, latest first.' : 'Cars you liked. Tap the heart to remove one.'}</p>
				</div>
			</div>
			<div className="fav-top">
				<div className="chips">
					{[
						{ s: '', l: 'All' },
						{ s: CarStatus.ACTIVE, l: 'For sale' },
						{ s: CarStatus.SOLD, l: 'Sold' },
					].map((t) => (
						<span key={t.l} className={`chip ${status === t.s ? 'on' : ''}`} onClick={() => setStatus(t.s as CarStatus | '')}>
							{t.l} <span className="num">{t.s ? all.filter((c) => c.carStatus === t.s).length : total}</span>
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
						<h3>{visited ? 'Nothing viewed yet' : 'No favourites yet'}</h3>
						<p>{visited ? 'Cars you open show up here.' : 'Tap the heart on any car to keep it here.'}</p>
						<Link href="/car" className="btn ghost">
							Browse cars
						</Link>
					</div>
				)
			)}
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyFavorites;
