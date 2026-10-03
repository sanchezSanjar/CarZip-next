import {
	CarBrand,
	CarColor,
	CarFuelType,
	CarLocation,
	CarMarket,
	CarOption,
	CarTransmission,
	CarType,
} from './enums/car.enum';
import { CarsSearch, NumberRange } from './types/car/car.input';
import { sortOptions } from './config';

/**
 * The car search in the address bar, readable and shareable:
 * /car?brand=KIA,HYUNDAI&fuel=HYBRID&year=2020-2027&price=1000-3000&sort=PRICE.ASC
 * Prices in the address are in 만원 (KRW) or dollars (priceUsd); everything is checked when read back.
 */

type Query = Record<string, string | string[] | undefined>;

const lists = {
	brand: { field: 'brandList', values: Object.values(CarBrand) },
	type: { field: 'typeList', values: Object.values(CarType) },
	color: { field: 'colorList', values: Object.values(CarColor) },
	location: { field: 'locationList', values: Object.values(CarLocation) },
	fuel: { field: 'fuelList', values: Object.values(CarFuelType) },
	transmission: { field: 'transmissionList', values: Object.values(CarTransmission) },
	option: { field: 'optionList', values: Object.values(CarOption) },
} as const;

const ranges = {
	price: { field: 'priceRange', scale: 10000 }, // 만원 in the address, won in the API
	priceUsd: { field: 'priceUsdRange', scale: 1 },
	mileage: { field: 'mileageRange', scale: 1 },
	year: { field: 'yearRange', scale: 1 },
} as const;

const flags = ['testDrive', 'rent', 'barter'] as const;

const one = (query: Query, key: string) => (typeof query[key] === 'string' ? (query[key] as string) : undefined);

const rangeToText = (r: NumberRange | undefined, scale: number) =>
	r && (r.start !== undefined || r.end !== undefined) ? `${r.start === undefined ? '' : r.start / scale}-${r.end === undefined ? '' : r.end / scale}` : undefined;

const textToRange = (text: string | undefined, scale: number): NumberRange | undefined => {
	const m = text?.match(/^(\d*)-(\d*)$/);
	if (!m || (!m[1] && !m[2])) return undefined;
	return { start: m[1] ? Number(m[1]) * scale : undefined, end: m[2] ? Number(m[2]) * scale : undefined };
};

/** search + sort -> address parameters (empty values are left out) */
export const searchToQuery = (search: CarsSearch, sortIndex: number): Record<string, string> => {
	const q: Record<string, string> = {};
	for (const [key, { field }] of Object.entries(lists)) {
		const list = search[field] as string[] | undefined;
		if (list?.length) q[key] = list.join(',');
	}
	if (search.modelList?.length) q.model = search.modelList.join(',');
	for (const [key, { field, scale }] of Object.entries(ranges)) {
		const text = rangeToText(search[field], scale);
		if (text) q[key] = text;
	}
	for (const f of flags) if (search[f]) q[f] = '1';
	if (search.market) q.market = search.market;
	if (search.text) q.text = search.text;
	if (sortIndex > 0) q.sort = `${sortOptions[sortIndex].sort}.${sortOptions[sortIndex].direction}`;
	return q;
};

/** address parameters -> search + sort; unknown or broken values are ignored */
export const queryToSearch = (query: Query): { search: CarsSearch; sortIndex: number } => {
	const search: CarsSearch = {};
	for (const [key, { field, values }] of Object.entries(lists)) {
		const picked = (one(query, key) ?? '').split(',').filter((v) => (values as readonly string[]).includes(v));
		if (picked.length) (search as Record<string, unknown>)[field] = picked;
	}
	const models = one(query, 'model')?.split(',').map((m) => m.trim()).filter(Boolean);
	if (models?.length) search.modelList = models;
	for (const [key, { field, scale }] of Object.entries(ranges)) {
		const range = textToRange(one(query, key), scale);
		if (range) search[field] = range;
	}
	for (const f of flags) if (one(query, f) === '1') search[f] = true;
	const market = one(query, 'market');
	if (market && (Object.values(CarMarket) as string[]).includes(market)) search.market = market as CarMarket;
	const text = one(query, 'text')?.trim();
	if (text && text.length >= 2) search.text = text.slice(0, 50);
	const sortText = one(query, 'sort');
	const sortIndex = Math.max(0, sortOptions.findIndex((o) => `${o.sort}.${o.direction}` === sortText));
	return { search, sortIndex };
};
