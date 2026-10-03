import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import Router from 'next/router';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client/react';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next/pages';
import { htmlLang } from '../libs/languages';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/theme.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	const [theme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	// the page's language tag follows the language switcher (screen readers, fonts, Korean line breaks).
	// Next.js writes our code "kr" there after every page change, so it is corrected right after.
	useEffect(() => {
		const setLang = () => {
			document.documentElement.lang = htmlLang(Router.locale);
		};
		setLang();
		Router.events.on('routeChangeComplete', setLang);
		return () => Router.events.off('routeChangeComplete', setLang);
	}, []);

	return (
		<ApolloProvider client={client}>
			<Head>
				{/* phones use their real screen width instead of pretending to be a desktop */}
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</Head>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
