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

// "Sort by" menu of the browse page
export const sortOptions = [
	{ label: 'Newest first', sort: 'CREATED_AT', direction: 'DESC' },
	{ label: 'Lowest price (KRW)', sort: 'PRICE', direction: 'ASC' },
	{ label: 'Highest price (KRW)', sort: 'PRICE', direction: 'DESC' },
	{ label: 'Lowest price (USD, export)', sort: 'PRICE_USD', direction: 'ASC' },
	{ label: 'Lowest mileage', sort: 'MILEAGE', direction: 'ASC' },
	{ label: 'Newest year', sort: 'YEAR', direction: 'DESC' },
	{ label: 'Oldest year', sort: 'YEAR', direction: 'ASC' },
	{ label: 'Most liked', sort: 'LIKES', direction: 'DESC' },
	{ label: 'Most viewed', sort: 'VIEWS', direction: 'DESC' },
];
