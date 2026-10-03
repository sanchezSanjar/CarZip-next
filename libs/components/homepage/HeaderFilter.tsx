import React, { useState } from 'react';
import { CarBrand, CarLocation } from '../../enums/car.enum';
import { enumLabel } from '../../utils';

/** dark search bar on top of the browse page */
const HeaderFilter = () => {
	const [text, setText] = useState('');
	const [brand, setBrand] = useState('');
	const [location, setLocation] = useState('');

	return (
		<div className="searchbar">
			<h1>Used cars from verified dealers</h1>
			<p>Every listing is posted by a dealer checked by CarZip. Contact them directly.</p>
			<div className="row">
				<input
					className="field"
					value={text}
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
				<select className="field" value={location} onChange={(e) => setLocation(e.target.value)}>
					<option value="">All of Korea</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{enumLabel(l)}
						</option>
					))}
				</select>
				<button className="btn primary">Search</button>
			</div>
		</div>
	);
};

export default HeaderFilter;
