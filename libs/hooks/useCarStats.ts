import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { GET_CARS } from '../../apollo/user/query';
import { Car, Cars } from '../types/car/car';

const PAGE = 100; // the API's largest page
const MAX_PAGES = 5;

/**
 * All cars for sale (up to 500), read page by page with the cursor, for the counts on the welcome page.
 * The API has no "count by brand" query; if the catalog grows past this, the counts belong in the backend.
 */
export const useCarStats = () => {
	const client = useApolloClient();
	const [cars, setCars] = useState<Car[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			const all: Car[] = [];
			let cursor: string | null | undefined;
			for (let page = 0; page < MAX_PAGES; page++) {
				const { data } = await client.query<{ getCars: Cars }>({
					query: GET_CARS,
					variables: { input: { limit: PAGE, ...(cursor ? { cursor } : {}) } },
					fetchPolicy: 'network-only',
				});
				all.push(...(data?.getCars.list ?? []));
				cursor = data?.getCars.nextCursor;
				if (!cursor) break;
			}
			if (!cancelled) {
				setCars(all);
				setLoading(false);
			}
		})().catch(() => !cancelled && setLoading(false));
		return () => {
			cancelled = true;
		};
	}, [client]);

	/** how many cars have each value of a field, e.g. count('carBrand') -> { KIA: 7, HYUNDAI: 9 } */
	const count = (field: keyof Car): Record<string, number> =>
		cars.reduce<Record<string, number>>((acc, car) => {
			const key = String(car[field]);
			acc[key] = (acc[key] ?? 0) + 1;
			return acc;
		}, {});

	return { cars, loading, count };
};
