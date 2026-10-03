import React from 'react';
import Link from 'next/link';
import { Box, Stack } from '@mui/material';
import { CarLocation } from '../enums/car.enum';
import { jejuX, jejuY, outline, px } from './homepage/KoreaMap';
import MapLinks from './common/MapLinks';
import { useTranslation } from 'next-i18next/pages';

const columns = [
	{
		title: 'footer.popular',
		links: [
			{ href: '/car?type=SUV', label: 'footer.suvs' },
			{ href: '/car?fuel=ELECTRIC', label: 'footer.electric' },
			{ href: '/car?fuel=HYBRID', label: 'footer.hybrids' },
			{ href: '/car?testDrive=1', label: 'footer.testDriveCars' },
		],
	},
	{
		title: 'footer.quickLinks',
		links: [
			{ href: '/agent', label: 'nav.dealers' },
			{ href: '/community', label: 'nav.community' },
			{ href: '/cs?tab=faq', label: 'footer.faq' },
			{ href: '/cs?tab=notices', label: 'footer.notices' },
			{ href: '/cs?tab=terms', label: 'footer.terms' },
		],
	},
	{
		title: 'footer.discover',
		links: [CarLocation.SEOUL, CarLocation.BUSAN, CarLocation.INCHEON, CarLocation.DAEGU, CarLocation.JEJU].map(
			(l) => ({
				href: `/car?location=${l}`,
				label: `enum.${l}`,
			}),
		),
	},
	{
		title: 'footer.forDealers',
		links: [
			{ href: '/account/join?mode=signup&type=AGENT', label: 'footer.becomeDealer' },
			{ href: '/account/join?mode=login', label: 'footer.dealerLogin' },
			{ href: '/mypage?category=addCar', label: 'footer.listCar' },
		],
	},
];

// the office pin (Gangnam, Seoul) on the same drawn map of Korea as the welcome page
const [officeX, officeY] = px(127.04, 37.5);
const OFFICE_ADDRESS = 'Teheran-ro, Gangnam-gu, Seoul';

const Footer = () => {
	const { t } = useTranslation('common');
	return (
		<Stack id="footer" className="footer-container">
			<Stack className="main">
				<Stack className="left">
					<Box className="footer-box">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/img/logo/carzip-logo-white.svg" alt="CarZip" className="logo" />
						<p className="about">{t('footer.about')}</p>
					</Box>
					<Box className="footer-box">
						<span>{t('footer.customerCare')}</span>
						<p>help@carzip.example.com</p>
						<span>{t('footer.hours')}</span>
					</Box>
					<Box className="footer-box">
						<span>{t('footer.office')}</span>
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
								<strong>{t(c.title)}</strong>
								{c.links.map((l) => (
									<Link key={l.label} href={l.href}>
										{t(l.label)}
									</Link>
								))}
							</div>
						))}
					</Box>
					<Box className="export-note">
						<b>{t('footer.exportTitle')}</b> {t('footer.exportText')}
					</Box>
				</Stack>
			</Stack>
			<Stack className="second">
				<span>© {new Date().getFullYear()} CarZip. {t('footer.rights')}</span>
				<span>{t('footer.demo')}</span>
			</Stack>
		</Stack>
	);
};

export default Footer;
