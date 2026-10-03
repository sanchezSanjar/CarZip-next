/** languages of the site: /car is English, /kr/car Korean, /ru/car Russian, /uz/car Uzbek */
module.exports = {
	i18n: {
		defaultLocale: 'en',
		locales: ['en', 'kr', 'ru', 'uz'],
		localeDetection: false, // the visitor picks the language; it is remembered in the browser
	},
	// in development, re-read public/locales on every request so edited texts show without a restart
	reloadOnPrerender: process.env.NODE_ENV === 'development',
};
