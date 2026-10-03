import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';

/** public pages: top navigation, page, footer */
const withLayoutBasic = <P extends object>(Component: React.ComponentType<P>, title = 'CarZip') => {
	const LayoutBasic = (props: P) => {
		return (
			<>
				<Head>
					<title>{title}</title>
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
