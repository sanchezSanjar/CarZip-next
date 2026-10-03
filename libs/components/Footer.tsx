import React from 'react';
import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import { CarLocation } from '../enums/car.enum';
import { enumLabel } from '../utils';
import { jejuX, jejuY, outline, px } from './homepage/KoreaMap';
import MapLinks from './common/MapLinks';

const columns = [
	{
		title: 'Popular searches',
		links: [
			{ href: '/car?type=SUV', label: 'SUVs' },
			{ href: '/car?fuel=ELECTRIC', label: 'Electric cars' },
			{ href: '/car?fuel=HYBRID', label: 'Hybrids' },
			{ href: '/car?testDrive=1', label: 'Cars you can test drive' },
		],
	},
	{
		title: 'Quick links',
		links: [
			{ href: '/agent', label: 'Dealers' },
			{ href: '/community', label: 'Community' },
			{ href: '/cs?tab=faq', label: 'FAQ' },
			{ href: '/cs?tab=notices', label: 'Notices' },
			{ href: '/cs?tab=terms', label: 'Terms of use' },
		],
	},
	{
		title: 'Discover',
		links: [CarLocation.SEOUL, CarLocation.BUSAN, CarLocation.INCHEON, CarLocation.DAEGU, CarLocation.JEJU].map(
			(l) => ({
				href: `/car?location=${l}`,
				label: enumLabel(l),
			}),
		),
	},
	{
		title: 'For dealers',
		links: [
			{ href: '/account/join?mode=signup&type=AGENT', label: 'Become a dealer' },
			{ href: '/account/join?mode=login', label: 'Dealer log in' },
			{ href: '/mypage?category=addCar', label: 'List a car' },
		],
	},
];

// the office pin (Gangnam, Seoul) on the same drawn map of Korea as the welcome page
const [officeX, officeY] = px(127.04, 37.5);
const OFFICE_ADDRESS = 'Teheran-ro, Gangnam-gu, Seoul';

const Footer = () => {
	return (
		<Stack id="footer" className="footer-container">
			<Stack className="main">
				<Stack className="left">
					<Box className="footer-box">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/img/logo/carzip-logo-white.svg" alt="CarZip" className="logo" />
						<p className="about">
							Used cars from verified dealers, all over Korea. Cars are listed and sold by independent dealers; CarZip
							is a marketplace and not a party to any sale.
						</p>
					</Box>
					<Box className="footer-box">
						<span>Customer care</span>
						<p>help@carzip.example.com</p>
						<span>Weekdays 10:00 to 18:00 (KST)</span>
					</Box>
					<Box className="footer-box">
						<span>Office</span>
						<p>{OFFICE_ADDRESS}</p>
						<div className="office-map">
							<svg className="map" viewBox="60 0 330 420" role="img" aria-label="CarZip office in Seoul">
								<path d={outline} className="land" />
								<ellipse cx={jejuX} cy={jejuY} rx="26" ry="11" className="land" />
								<circle cx={officeX} cy={officeY} r="16" className="pulse" />
								<circle cx={officeX} cy={officeY} r="7" className="pin" />
							</svg>
							<MapLinks query={OFFICE_ADDRESS} />
						</div>
					</Box>
				</Stack>
				<Stack className="right">
					<Box className="bottom">
						{columns.map((c) => (
							<div key={c.title}>
								<strong>{c.title}</strong>
								{c.links.map((l) => (
									<Link key={l.label} href={l.href}>
										{l.label}
									</Link>
								))}
							</div>
						))}
					</Box>
					<Box className="export-note">
						<b>Buying for export?</b> The dealer is fully responsible for the export: paperwork, deregistration,
						customs, shipping and payment.
					</Box>
				</Stack>
			</Stack>
			<Stack className="second">
				<span>© {new Date().getFullYear()} CarZip. All rights reserved.</span>
				<span>Demo project: all dealers, cars and people on this site are fictional.</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
