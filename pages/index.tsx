import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';

/** the welcome page comes next; until then the home page opens the car search */
const Home: NextPage = () => {
	const router = useRouter();

	useEffect(() => {
		router.replace('/car').then();
	}, [router]);

	return null;
};

export default Home;
