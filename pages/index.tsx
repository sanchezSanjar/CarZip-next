import React, { useState } from 'react';
import { NextPage } from 'next';
import { Menu, MenuItem } from '@mui/material';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import HeaderFilter from '../libs/components/homepage/HeaderFilter';
import Filter from '../libs/components/homepage/Filter';
import CarCard from '../libs/components/common/CarCard';
import { sampleCars } from '../libs/sampleData';
import { sortOptions } from '../libs/config';

const Home: NextPage = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const [sortIndex, setSortIndex] = useState(0);
	const cars = sampleCars;

	return (
		<>
			<HeaderFilter />
			<div className="browse">
				<Filter />
				<main>
					<div className="results-head">
						<h2>
							<span className="num">{cars.length}</span> cars match
						</h2>
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
					<div className="grid3">
						{cars.map((car) => (
							<CarCard key={car._id} car={car} />
						))}
					</div>
					<div className="more">
						<button className="btn ghost" style={{ width: 260 }}>
							Show more cars
						</button>
						Showing {cars.length} of {cars.length}
					</div>
				</main>
			</div>
		</>
	);
};

export default withLayoutBasic(Home, 'CarZip | Used cars from verified dealers');
