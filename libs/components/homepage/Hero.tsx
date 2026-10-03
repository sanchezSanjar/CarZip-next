import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { CarBrand } from '../../enums/car.enum';
import { enumLabel } from '../../utils';

const quickBrands = [CarBrand.HYUNDAI, CarBrand.KIA, CarBrand.GENESIS, CarBrand.BMW, CarBrand.MERCEDES, CarBrand.TESLA];

/**
 * Full-width welcome: drone footage of a car market (public/video/hero.mp4) with the logo and a quick search.
 * Until the video file exists, the browser simply shows the poster image.
 */
const Hero = () => {
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
				<h1>Used cars from verified dealers, all over Korea</h1>
				<p>Every dealer is checked by our team. Browse, book a test drive and contact them directly.</p>
				<form className="hero-search" onSubmit={searchHandler}>
					<input
						className="field"
						value={text}
						maxLength={50}
						onChange={(e) => setText(e.target.value)}
						placeholder="Search a model, e.g. Sorento, GV70, Model 3"
					/>
					<select className="field" value={brand} onChange={(e) => setBrand(e.target.value)}>
						<option value="">All brands</option>
						{Object.values(CarBrand).map((b) => (
							<option key={b} value={b}>
								{enumLabel(b)}
							</option>
						))}
					</select>
					<button className="btn primary">Find a car</button>
				</form>
				<div className="hero-quick">
					Popular:
					{quickBrands.map((b) => (
						<a key={b} onClick={() => router.push({ pathname: '/car', query: { brand: b } })}>
							{enumLabel(b)}
						</a>
					))}
				</div>
			</div>
		</section>
	);
};

export default Hero;
