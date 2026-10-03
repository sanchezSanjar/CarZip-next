import { useRouter } from 'next/router';

// our language codes -> the codes the browser's Intl formatting understands.
// Browsers don't ship full Uzbek data, so Uzbek numbers use the same style as Russian (space, comma)
// and Uzbek times and dates are written by hand below.
const INTL: Record<string, string> = { en: 'en-GB', kr: 'ko-KR', ru: 'ru-RU', uz: 'ru-RU' };
const UZ_MONTHS = ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'];
const UZ_UNITS = { minute: 'daqiqa', hour: 'soat', day: 'kun' };
const uzDate = (d: Date, withYear = false) => `${d.getDate()}-${UZ_MONTHS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ''}`;

/**
 * Times, dates, numbers and prices in the visitor's language, using the browser's built-in Intl formatting
 * ("2 days ago" -> "2일 전" / "2 дня назад" / "2 kun oldin"), so plural rules come for free.
 */
export const useLocaleFormat = () => {
	const { locale = 'en' } = useRouter();
	const intl = INTL[locale] ?? 'en-GB';

	const number = (n?: number | null) => new Intl.NumberFormat(intl).format(n ?? 0);

	const timeAgo = (date?: Date | string | null) => {
		if (!date) return '';
		const sec = Math.round((new Date(date).getTime() - Date.now()) / 1000); // negative = in the past
		const abs = Math.abs(sec);
		if (locale === 'uz') {
			if (abs < 60) return 'hozir';
			const [n, unit] = abs < 3600 ? [Math.round(abs / 60), 'minute'] : abs < 86400 ? [Math.round(abs / 3600), 'hour'] : [Math.round(abs / 86400), 'day'];
			if (unit === 'day' && n >= 30) return uzDate(new Date(date), true);
			return `${n} ${UZ_UNITS[unit as keyof typeof UZ_UNITS]} ${sec < 0 ? 'oldin' : 'keyin'}`;
		}
		const rtf = new Intl.RelativeTimeFormat(intl, { numeric: 'auto' });
		if (abs < 60) return rtf.format(0, 'second');
		if (abs < 3600) return rtf.format(Math.round(sec / 60), 'minute');
		if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour');
		if (abs < 86400 * 30) return rtf.format(Math.round(sec / 86400), 'day');
		return new Date(date).toLocaleDateString(intl, { day: 'numeric', month: 'short', year: 'numeric' });
	};

	const date = (d?: Date | string | null, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) => {
		if (!d) return '';
		if (locale === 'uz') return uzDate(new Date(d), !!options.year);
		return new Date(d).toLocaleDateString(intl, options);
	};

	const dateTime = (d?: Date | string | null) => {
		if (!d) return '';
		const x = new Date(d);
		if (locale === 'uz') return `${uzDate(x)}, ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`;
		return x.toLocaleString(intl, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
	};

	/** a KRW price split into a big number and a small unit: Korean keeps 만원, others read millions of won */
	const krw = (won?: number | null): { value: string; unit: string } => {
		const w = won ?? 0;
		if (locale === 'kr') return { value: number(Math.round(w / 10000)), unit: '만원' };
		const millions = new Intl.NumberFormat(intl, { maximumFractionDigits: 1 }).format(w / 1_000_000);
		if (locale === 'ru') return { value: millions, unit: 'млн ₩' };
		if (locale === 'uz') return { value: millions, unit: 'mln ₩' };
		return { value: `₩${millions}`, unit: 'M' };
	};

	const usd = (n?: number | null) => `$${number(n)}`;

	/** the short price used in tables: "3,150만원" / "₩31.5M" / "$22,800" */
	const carPrice = (car: { carMarket: string; carPrice?: number | null; carPriceUsd?: number | null }) => {
		if (car.carMarket === 'EXPORT') return usd(car.carPriceUsd);
		const p = krw(car.carPrice);
		return locale === 'kr' || locale === 'en' ? `${p.value}${p.unit}` : `${p.value} ${p.unit}`;
	};

	return { locale, intl, number, timeAgo, date, dateTime, krw, usd, carPrice };
};
