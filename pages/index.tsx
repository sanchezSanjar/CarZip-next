import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import Hero from '../libs/components/homepage/Hero';

/** welcome page: first impression, then the way into the car search */
const Home: NextPage = () => {
	return (
		<>
			<Hero />
		</>
	);
};

export default withLayoutBasic(Home, 'CarZip | Used cars from verified dealers');
