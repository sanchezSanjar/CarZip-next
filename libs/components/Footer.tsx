import React from 'react';
import Link from 'next/link';
import { Logo } from './Top';

const Footer = () => {
	return (
		<footer className="sitefoot">
			<Logo size={20} />
			<p>
				<b>CarZip is a marketplace.</b> Cars are listed and sold by independent dealers. For cars marked for export, the
				dealer is fully responsible for the export: paperwork, deregistration, customs, shipping and payment. CarZip is
				not a party to any sale.
			</p>
			<span>
				<Link href="/cs" style={{ color: 'inherit' }}>
					Help
				</Link>{' '}
				·{' '}
				<Link href="/cs?tab=terms" style={{ color: 'inherit' }}>
					Terms
				</Link>{' '}
				·{' '}
				<Link href="/cs?tab=terms" style={{ color: 'inherit' }}>
					Privacy
				</Link>
			</span>
		</footer>
	);
};

export default Footer;
