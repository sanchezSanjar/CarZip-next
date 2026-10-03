import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { CarBrand } from '../../enums/car.enum';

import { useTranslation } from 'next-i18next/pages';
import CountUp from '../common/CountUp';

const quickBrands = [CarBrand.HYUNDAI, CarBrand.KIA, CarBrand.GENESIS, CarBrand.BMW, CarBrand.MERCEDES, CarBrand.TESLA];

/**
 * Full-width welcome: drone footage of a car market (public/video/hero.mp4) with the logo and a quick search.
 * Until the video file exists, the browser simply shows the poster image.
 */
const Hero = ({ stats }: { stats: { cars: number; dealers: number; cities: number } }) => {
	const { t } = useTranslation('common');
	const router = useRouter();
	const [text, setText] = useState('');
	const [brand, setBrand] = useState('');

	/** HANDLERS **/
	const searchHandler = (e: React.FormEvent) => {
		e.preventDefault();
		const query: Record<string, string> = {};
		if (text.trim().length >= 2) query.text = text.trim();
		if (brand) query.brand = brand;
		router.push({ pathname: '/car', query }).then();
	};

	return (
		<section className="hero">
			<video className="hero-media" autoPlay muted loop playsInline poster="/img/hero-poster.jpg" aria-hidden="true">
				<source src="/video/hero.mp4" type="video/mp4" />
			</video>
			<div className="hero-shade" />
			<div className="hero-inner">
				<div className="hero-logo">
					<i>Z</i>CarZip
				</div>
				<h1>{t('home.heroTitle')}</h1>
				<p>{t('home.heroText')}</p>
				<form className="hero-search" onSubmit={searchHandler}>
					<input
						className="field"
						value={text}
						maxLength={50}
						onChange={(e) => setText(e.target.value)}
						placeholder={t('home.searchPlaceholder')}
					/>
					<select className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
						<option value="">{t('home.allBrands')}</option>
						{Object.values(CarBrand).map((b) => (
							<option key={b} value={b}>
								{t(`enum.${b}`)}
							</option>
						))}
					</select>
					<button className="btn primary">{t('home.findCar')}</button>
				</form>
				<div className="hero-quick">
					{t('home.popular')}
					{quickBrands.map((b) => (
						<a key={b} onClick={() => router.push({ pathname: '/car', query: { brand: b } })}>
							{t(`enum.${b}`)}
						</a>
					))}
				</div>
				{stats.cars > 0 && (
					<div className="hero-stats">
						<div>
							<b>
								<CountUp value={stats.cars} />
							</b>
							{t('home.statCars')}
						</div>
						<div>
							<b>
								<CountUp value={stats.dealers} />
							</b>
							{t('home.statDealers')}
						</div>
						<div>
							<b>
								<CountUp value={stats.cities} />
							</b>
							{t('home.statCities')}
						</div>
					</div>
				)}
			</div>
		</section>
	);
};

export default Hero;
