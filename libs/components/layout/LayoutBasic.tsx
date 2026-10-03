import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { useTranslation } from 'next-i18next/pages';

/** public pages: top navigation, page, footer; the tab title is a translation key like 'title.dealers' */
const withLayoutBasic = <P extends object>(Component: React.ComponentType<P>, titleKey = 'title.home') => {
	const LayoutBasic = (props: P) => {
		const { t } = useTranslation('common');
		return (
			<>
				<Head>
					<title>{t(titleKey)}</title>
				</Head>
				<div id="pc-wrap">
					<Top />
					<div id="main">
						<Component {...props} />
					</div>
					<Footer />
				</div>
			</>
		);
	};
	return LayoutBasic;
};

export default withLayoutBasic;
