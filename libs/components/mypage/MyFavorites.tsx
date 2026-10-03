import React, { useState } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { sampleCars } from '../../sampleData';
import { CarStatus } from '../../enums/car.enum';
import CarCard from '../common/CarCard';
import Pager from '../common/Pager';

// sample: liked cars, one of them already sold
const favorites = [sampleCars[2], sampleCars[4], sampleCars[7], sampleCars[3], sampleCars[0], { ...sampleCars[1], carStatus: CarStatus.SOLD }].map(
	(c) => ({ ...c, meLiked: [{ memberId: 'me', likeRefId: c._id, myFavorite: true }] }),
);

/** cars I liked (favorites) or opened (recently viewed); only cars for sale or sold are shown */
const MyFavorites = ({ visited = false }: { visited?: boolean }) => {
	const user = useReactiveVar(userVar);
	const [status, setStatus] = useState<CarStatus | ''>('');
	const [page, setPage] = useState(1);
	const cars = favorites.filter((c) => !status || c.carStatus === status);

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
							{t.l} <span className="num">{favorites.filter((c) => !t.s || c.carStatus === t.s).length}</span>
						</span>
					))}
				</div>
			</div>
			{cars.length ? (
				<div className="grid3">
					{cars.map((car) => (
						<CarCard key={car._id} car={car} mine={car.memberId === user._id} />
					))}
				</div>
			) : (
				<div className="empty">
					<h3>{visited ? 'Nothing viewed yet' : 'No favourites yet'}</h3>
					<p>{visited ? 'Cars you open show up here.' : 'Tap the heart on any car to keep it here.'}</p>
					<Link href="/car" className="btn ghost">
						Browse cars
					</Link>
				</div>
			)}
			<Pager page={page} total={1} onChange={setPage} />
		</>
	);
};

export default MyFavorites;
