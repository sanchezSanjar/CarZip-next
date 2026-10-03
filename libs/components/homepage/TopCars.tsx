import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_CARS } from '../../../apollo/user/query';
import { Cars } from '../../types/car/car';
import { CarSort } from '../../enums/car.enum';
import { Direction } from '../../enums/common.enum';
import { useLikeCar } from '../../hooks/useLikeCar';
import CarCard from '../common/CarCard';
import { useTranslation } from 'next-i18next/pages';
import Carousel from '../common/Carousel';
import useDeviceDetect from '../../hooks/useDeviceDetect';

const tabs = [
	{ sort: CarSort.LIKES, label: 'home.mostLiked' },
	{ sort: CarSort.VIEWS, label: 'home.mostViewed' },
	{ sort: CarSort.CREATED_AT, label: 'home.justListed' },
];

/** car rankings: per tab, the top 12 cars in a slider with arrows */
const TopCars = () => {
	const { t } = useTranslation('common');
	const [sort, setSort] = useState(CarSort.LIKES);
	const likeCarHandler = useLikeCar();
	const perSlide = useDeviceDetect() === 'mobile' ? 1 : 4;

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { limit: 12, sort, direction: Direction.DESC } },
	});
	const cars = data?.getCars.list ?? [];
	const slides = Array.from({ length: Math.ceil(cars.length / perSlide) }, (_, p) => (
		<div key={p} className="grid4 home-cars">
			{cars.slice(p * perSlide, p * perSlide + perSlide).map((car) => (
				<CarCard key={car._id} car={car} likeCarHandler={likeCarHandler} />
			))}
		</div>
	));

	return (
		<section className="home-section">
			<div className="home-head">
				<div>
					<h2>{t('home.popularNow')}</h2>
					<p>{t('home.popularText')}</p>
				</div>
				<div className="seg" style={{ width: 'auto' }}>
					{tabs.map((tab) => (
						<span
							key={tab.sort}
							className={sort === tab.sort ? 'on' : ''}
							style={{ padding: '6px 18px' }}
							onClick={() => setSort(tab.sort)}
						>
							{t(tab.label)}
						</span>
					))}
				</div>
			</div>
			<div style={{ opacity: loading && !cars.length ? 0.4 : 1 }}>
				{/* a new tab starts again at its first slide */}
				<Carousel key={sort} slides={slides} />
			</div>
			<div style={{ textAlign: 'center', marginTop: 22 }}>
				<Link href="/car" className="btn dark">
					{t('home.seeAllCars')}
				</Link>
			</div>
		</section>
	);
};

export default TopCars;
