import { CarColor, CarMarket } from './enums/car.enum';

/** 31500000 -> "3,150" (shown with 만원) */
export const formatManwon = (krw?: number | null): string => (krw ? Math.round(krw / 10000).toLocaleString('en-US') : '0');

export const formatNumber = (n?: number | null): string => (n ?? 0).toLocaleString('en-US');

export const formatUsd = (usd?: number | null): string => `$${formatNumber(usd)}`;

/** price to show in lists: KRW for Korea, USD for export-only cars */
export const formatCarPrice = (car: { carMarket: CarMarket; carPrice?: number | null; carPriceUsd?: number | null }) =>
	car.carMarket === CarMarket.EXPORT ? formatUsd(car.carPriceUsd) : `${formatManwon(car.carPrice)}만원`;

/** "PLUG_IN_HYBRID" -> "Plug-in hybrid" */
export const enumLabel = (value?: string | null): string => {
	if (!value) return '';
	const special: Record<string, string> = { PLUG_IN_HYBRID: 'Plug-in hybrid', HIPASS: 'Hi-pass', KGM: 'KGM', BMW: 'BMW', SUV: 'SUV', LPG: 'LPG', FREE: 'Free talk' };
	if (special[value]) return special[value];
	const words = value.toLowerCase().split('_');
	return words.map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
};

export const marketLabel: Record<CarMarket, string> = {
	[CarMarket.DOMESTIC]: 'Korea',
	[CarMarket.EXPORT]: 'Export only',
	[CarMarket.BOTH]: 'Korea and export',
};

export const colorHex: Record<CarColor, string> = {
	[CarColor.WHITE]: '#F4F5F3',
	[CarColor.PEARL_WHITE]: '#EEEBE2',
	[CarColor.BLACK]: '#262B30',
	[CarColor.GRAY]: '#7D848B',
	[CarColor.SILVER]: '#BCC1C6',
	[CarColor.BLUE]: '#2F5E9E',
	[CarColor.RED]: '#A83434',
	[CarColor.BROWN]: '#7A5A43',
	[CarColor.BEIGE]: '#CDBB9A',
	[CarColor.GREEN]: '#3F6B4F',
	[CarColor.OTHER]: 'conic-gradient(#A83434,#F5A623,#3F6B4F,#2F5E9E,#A83434)',
};

/** "2 days ago", "5 min ago" */
export const timeAgo = (date?: Date | string | null): string => {
	if (!date) return '';
	const sec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
	if (sec < 60) return 'just now';
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min} min ago`;
	const hours = Math.floor(min / 60);
	if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	const days = Math.floor(hours / 24);
	if (days === 1) return 'yesterday';
	if (days < 30) return `${days} days ago`;
	return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** "Sat 3 Oct, 10:30" */
export const formatDateTime = (date?: Date | string | null): string => {
	if (!date) return '';
	const d = new Date(date);
	return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`.replace(',', '');
};

/** the dealer's company name, or their nick when there is none */
export const dealerName = (member?: { agentCompany?: string | null; memberNick: string } | null): string =>
	member?.agentCompany || member?.memberNick || '';
