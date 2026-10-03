import React from 'react';
import Link from 'next/link';
import { Logo } from './Top';

const columns = [
	{
		title: 'Buy',
		links: [
			{ href: '/car', label: 'Buy a car' },
			{ href: '/car?type=SUV', label: 'SUVs' },
			{ href: '/car?fuel=ELECTRIC', label: 'Electric cars' },
			{ href: '/agent', label: 'Dealers' },
		],
	},
	{
		title: 'Community',
		links: [
			{ href: '/community', label: 'Articles' },
			{ href: '/cs?tab=notices', label: 'Notices' },
			{ href: '/cs?tab=faq', label: 'FAQ' },
		],
	},
	{
		title: 'For dealers',
		links: [
			{ href: '/account/join?mode=signup&type=AGENT', label: 'Become a dealer' },
			{ href: '/account/join?mode=login', label: 'Dealer log in' },
		],
	},
	{
		title: 'CarZip',
		links: [
			{ href: '/cs?tab=terms', label: 'Terms of use' },
			{ href: '/cs?tab=terms', label: 'Privacy policy' },
			{ href: '/cs', label: 'Help' },
		],
	},
];

const Footer = () => {
	return (
		<footer className="sitefoot">
			<div className="foot-top">
				<div className="foot-brand">
					<Logo size={22} />
					<p>
						<b>CarZip is a marketplace.</b> Cars are listed and sold by independent, verified dealers. For cars marked for
						export, the dealer is fully responsible for the export: paperwork, deregistration, customs, shipping and payment.
						CarZip is not a party to any sale.
					</p>
				</div>
				{columns.map((c) => (
					<div key={c.title} className="foot-col">
						<b>{c.title}</b>
						{c.links.map((l) => (
							<Link key={l.label} href={l.href}>
								{l.label}
							</Link>
						))}
					</div>
				))}
			</div>
			<div className="foot-bottom">
				<span>© {new Date().getFullYear()} CarZip</span>
				<span>Demo project: all dealers, cars and people on this site are fictional.</span>
			</div>
		</footer>
	);
};

export default Footer;
