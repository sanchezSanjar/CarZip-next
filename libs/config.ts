export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3007';
export const GRAPHQL_URL = `${API_URL}/graphql`;
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:3007';

const thisYear = new Date().getFullYear();
export const carYears: number[] = [];
for (let i = thisYear + 1; i >= 1990; i--) carYears.push(i);

export const Messages = {
	error1: 'Something went wrong!',
	error2: 'Please login first!',
	error3: 'Please fill in all required fields!',
	error4: 'Message is empty!',
	error5: 'Only jpeg, png and webp images are allowed!',
};

// "Sort by" menu of the browse page (labels are translation keys)
export const sortOptions = [
	{ label: 'sort.newest', sort: 'CREATED_AT', direction: 'DESC' },
	{ label: 'sort.priceLow', sort: 'PRICE', direction: 'ASC' },
	{ label: 'sort.priceHigh', sort: 'PRICE', direction: 'DESC' },
	{ label: 'sort.usdLow', sort: 'PRICE_USD', direction: 'ASC' },
	{ label: 'sort.mileage', sort: 'MILEAGE', direction: 'ASC' },
	{ label: 'sort.yearNew', sort: 'YEAR', direction: 'DESC' },
	{ label: 'sort.yearOld', sort: 'YEAR', direction: 'ASC' },
	{ label: 'sort.likes', sort: 'LIKES', direction: 'DESC' },
	{ label: 'sort.views', sort: 'VIEWS', direction: 'DESC' },
];
