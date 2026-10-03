import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { Menu, MenuItem } from '@mui/material';
import { useQuery } from '@apollo/client/react';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import HeaderFilter from '../libs/components/homepage/HeaderFilter';
import Filter from '../libs/components/homepage/Filter';
import CarCard from '../libs/components/common/CarCard';
import { GET_CARS } from '../apollo/user/query';
import { sortOptions } from '../libs/config';
import { Cars } from '../libs/types/car/car';
import { CarsInquiry } from '../libs/types/car/car.input';
import { CarSort } from '../libs/enums/car.enum';
import { Direction } from '../libs/enums/common.enum';

const PAGE_SIZE = 9;

const Home: NextPage = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortIndex, setSortIndex] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	// a cursor belongs to its sort: changing the sort starts again from the first page
	const input: CarsInquiry = {
		limit: PAGE_SIZE,
		sort: sortOptions[sortIndex].sort as CarSort,
		direction: sortOptions[sortIndex].direction as Direction,
	};

	/** APOLLO REQUESTS **/
	const {
		loading: getCarsLoading,
		data: getCarsData,
		error: getCarsError,
		fetchMore,
	} = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const cars = getCarsData?.getCars.list ?? [];
	const nextCursor = getCarsData?.getCars.nextCursor;

	/** HANDLERS **/
	const showMoreHandler = async () => {
		if (!nextCursor) return;
		setLoadingMore(true);
		try {
			await fetchMore({
				variables: { input: { ...input, cursor: nextCursor } },
				updateQuery: (prev, { fetchMoreResult }) => ({
					getCars: {
						...fetchMoreResult.getCars,
						list: [...(prev.getCars?.list ?? []), ...fetchMoreResult.getCars.list],
					},
				}),
			});
		} finally {
			setLoadingMore(false);
		}
	};

	return (
		<>
			<HeaderFilter />
			<div className="browse">
				<Filter />
				<main>
					<div className="results-head">
						<h2>{getCarsLoading && !cars.length ? 'Loading cars…' : `${cars.length} cars${nextCursor ? '+' : ''} for sale`}</h2>
						<div className="sort">
							Sort by
							<div className="field" role="button" style={{ cursor: 'pointer' }} onClick={(e) => setAnchorEl(e.currentTarget)}>
								{sortOptions[sortIndex].label} <span>▾</span>
							</div>
							<Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
								{sortOptions.map((o, i) => (
									<MenuItem
										key={o.label}
										selected={i === sortIndex}
										onClick={() => {
											setSortIndex(i);
											setAnchorEl(null);
										}}
									>
										{o.label}
									</MenuItem>
								))}
							</Menu>
						</div>
					</div>

					{getCarsError && (
						<div className="banner err" style={{ marginBottom: 20 }}>
							<span className="i">!</span>
							<div>
								<b>Couldn&apos;t load cars</b>
								{getCarsError.message}
							</div>
						</div>
					)}

					{!getCarsLoading && !getCarsError && !cars.length ? (
						<div className="empty">
							<h3>No cars for sale yet</h3>
							<p>Verified dealers&apos; listings will appear here. Are you a dealer?</p>
							<Link href="/account/join?mode=signup&type=AGENT" className="btn dark">
								List your cars on CarZip
							</Link>
						</div>
					) : (
						<div className="grid3">
							{cars.map((car) => (
								<CarCard key={car._id} car={car} />
							))}
						</div>
					)}

					{nextCursor && (
						<div className="more">
							<button className="btn ghost" style={{ width: 260 }} onClick={showMoreHandler} disabled={loadingMore}>
								{loadingMore ? 'Loading…' : 'Show more cars'}
							</button>
							Showing {cars.length}
						</div>
					)}
				</main>
			</div>
		</>
	);
};

export default withLayoutBasic(Home, 'CarZip | Used cars from verified dealers');
