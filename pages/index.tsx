import React from 'react';
import { NextPage } from 'next';
import withLayoutBasic from '../libs/components/layout/LayoutBasic';
import Hero from '../libs/components/homepage/Hero';
import TopAgents from '../libs/components/homepage/TopAgents';
import QuickBrowse from '../libs/components/homepage/QuickBrowse';
import ValueCards from '../libs/components/homepage/ValueCards';
import TopCars from '../libs/components/homepage/TopCars';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import KoreaMap from '../libs/components/homepage/KoreaMap';
import GuidesNotices from '../libs/components/homepage/GuidesNotices';
import { useCarStats } from '../libs/hooks/useCarStats';
import { withTranslations } from '../libs/i18n';

/** welcome page: first impression, then the way into the car search */
const Home: NextPage = () => {
	const { cars, count } = useCarStats();

	return (
		<>
			<Hero />
			<QuickBrowse count={count} total={cars.length} />
			<ValueCards />
			<TopAgents />
			<TopCars />
			<CommunityBoards />
			<KoreaMap counts={count('carLocation')} />
			<GuidesNotices />
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(Home, 'CarZip | Used cars from verified dealers');
