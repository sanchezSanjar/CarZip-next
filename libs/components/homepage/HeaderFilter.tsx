import React, { useState } from 'react';
import { CarBrand, CarLocation } from '../../enums/car.enum';
import { CarsSearch } from '../../types/car/car.input';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { enumLabel } from '../../utils';

interface HeaderFilterProps {
	search: CarsSearch;
	setSearch: (search: CarsSearch) => void;
}

/** dark search bar on top of the browse page: text, one brand and one city */
const HeaderFilter = ({ search, setSearch }: HeaderFilterProps) => {
	const [text, setText] = useState(search.text ?? '');

	/** HANDLERS **/
	const searchHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const t = text.trim();
		if (t && (t.length < 2 || t.length > 50)) return sweetMixinErrorAlert('Type 2 to 50 characters to search');
		setSearch({ ...search, text: t || undefined });
	};

	return (
		<div className="searchbar">
			<h1>Used cars from verified dealers</h1>
			<p>Every listing is posted by a dealer checked by CarZip. Contact them directly.</p>
			<form className="row" onSubmit={searchHandler}>
				<input
					className="field"
					value={text}
					maxLength={50}
					onChange={(e) => setText(e.target.value)}
					placeholder="Search a model, e.g. Sorento, GV70, Model 3"
				/>
				<select
					className="field"
					value={search.brandList?.length === 1 ? search.brandList[0] : ''}
					onChange={(e) => setSearch({ ...search, brandList: e.target.value ? [e.target.value as CarBrand] : undefined, modelList: undefined })}
				>
					<option value="">All brands</option>
					{Object.values(CarBrand).map((b) => (
						<option key={b} value={b}>
							{enumLabel(b)}
						</option>
					))}
				</select>
				<select
					className="field"
					value={search.locationList?.length === 1 ? search.locationList[0] : ''}
					onChange={(e) => setSearch({ ...search, locationList: e.target.value ? [e.target.value as CarLocation] : undefined })}
				>
					<option value="">All of Korea</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{enumLabel(l)}
						</option>
					))}
				</select>
				<button className="btn primary">Search</button>
			</form>
		</div>
	);
};

export default HeaderFilter;
