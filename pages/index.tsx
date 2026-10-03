import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import Hero from '../libs/components/homepage/Hero';
import TopAgents from '../libs/components/homepage/TopAgents';
import QuickBrowse from '../libs/components/homepage/QuickBrowse';
import ValueCards from '../libs/components/homepage/ValueCards';
import { useCarStats } from '../libs/hooks/useCarStats';

/** welcome page: first impression, then the way into the car search */
const Home: NextPage = () => {
	const { cars, count } = useCarStats();

	return (
		<>
			<Hero />
			<QuickBrowse count={count} total={cars.length} />
			<ValueCards />
			<TopAgents />
		</>
	);
};

export default withLayoutBasic(Home, 'CarZip | Used cars from verified dealers');
