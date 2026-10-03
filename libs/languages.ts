/** the site's languages (safe for the browser; the server-only loader lives in libs/i18n.ts) */
export const languages = [
	{ code: 'en', label: 'English', short: 'EN' },
	{ code: 'kr', label: '한국어', short: 'KO' },
	{ code: 'ru', label: 'Русский', short: 'RU' },
	{ code: 'uz', label: "O'zbekcha", short: 'UZ' },
] as const;

/** the page's language tag: our "kr" is "ko", the standard code for Korean */
export const htmlLang = (locale?: string) => (locale === 'kr' ? 'ko' : locale || 'en');
