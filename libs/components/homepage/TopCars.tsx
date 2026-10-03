import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_CARS } from '../../../apollo/user/query';
import { Cars } from '../../types/car/car';
import { CarSort } from '../../enums/car.enum';
import { Direction } from '../../enums/common.enum';
import { useLikeCar } from '../../hooks/useLikeCar';
import CarCard from '../common/CarCard';

const tabs = [
	{ sort: CarSort.LIKES, label: 'Most liked' },
	{ sort: CarSort.VIEWS, label: 'Most viewed' },
	{ sort: CarSort.CREATED_AT, label: 'Just listed' },
];

/** car rankings: one row of cards per tab */
const TopCars = () => {
	const [sort, setSort] = useState(CarSort.LIKES);
	const likeCarHandler = useLikeCar();

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { limit: 4, sort, direction: Direction.DESC } },
	});
	const cars = data?.getCars.list ?? [];

	return (
		<section className="home-section">
			<div className="home-head">
				<div>
					<h2>Popular right now</h2>
					<p>What buyers on CarZip are looking at.</p>
				</div>
				<div className="seg" style={{ width: 'auto' }}>
					{tabs.map((t) => (
						<span key={t.sort} className={sort === t.sort ? 'on' : ''} style={{ padding: '6px 18px' }} onClick={() => setSort(t.sort)}>
							{t.label}
						</span>
					))}
				</div>
			</div>
			<div className="grid4 home-cars" style={{ opacity: loading && !cars.length ? 0.4 : 1 }}>
				{cars.map((car) => (
					<CarCard key={car._id} car={car} likeCarHandler={likeCarHandler} />
				))}
			</div>
			<div style={{ textAlign: 'center', marginTop: 22 }}>
				<Link href="/car" className="btn dark">
					See all cars
				</Link>
			</div>
		</section>
	);
};

export default TopCars;
