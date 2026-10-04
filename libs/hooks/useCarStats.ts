import { useQuery } from '@apollo/client/react';
import { GET_CAR_STATS } from '../../apollo/user/query';

interface StatCount {
	value: string;
	count: number;
}

interface CarStats {
	total: number;
	dealers: number;
	brands: StatCount[];
	types: StatCount[];
	fuels: StatCount[];
	locations: StatCount[];
}

/** which list of the stats answers each car field */
const LISTS = {
	carBrand: 'brands',
	carType: 'types',
	carFuelType: 'fuels',
	carLocation: 'locations',
} as const;

export type StatField = keyof typeof LISTS;

/**
 * The numbers on the welcome page: cars for sale, dealers, and counts per brand, type, fuel and region.
 * The API counts them in one query (and caches them), so the browser doesn't download every car.
 */
export const useCarStats = () => {
	const { data, loading } = useQuery<{ getCarStats: CarStats }>(GET_CAR_STATS, { fetchPolicy: 'cache-and-network' });
	const stats = data?.getCarStats;

	/** how many cars have each value of a field, e.g. count('carBrand') -> { KIA: 7, HYUNDAI: 9 } */
	const count = (field: StatField): Record<string, number> =>
		Object.fromEntries((stats?.[LISTS[field]] ?? []).map(({ value, count }) => [value, count]));

	return { total: stats?.total ?? 0, dealers: stats?.dealers ?? 0, loading, count };
};
