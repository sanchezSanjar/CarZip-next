import React from 'react';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';

/** public pages: top navigation, page, footer */
const withLayoutBasic = (Component: React.ComponentType<any>, title = 'CarZip') => {
	const LayoutBasic = (props: any) => {
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
