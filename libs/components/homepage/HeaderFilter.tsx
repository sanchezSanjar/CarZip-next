import React, { useState } from 'react';
import { CarBrand, CarLocation } from '../../enums/car.enum';
import { CarsSearch } from '../../types/car/car.input';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useTranslation } from 'next-i18next/pages';

interface HeaderFilterProps {
	search: CarsSearch;
	setSearch: (search: CarsSearch) => void;
}

/** dark search bar on top of the browse page: text, one brand and one city */
const HeaderFilter = ({ search, setSearch }: HeaderFilterProps) => {
	const { t } = useTranslation('common');
	const [text, setText] = useState(search.text ?? '');

	/** HANDLERS **/
	const searchHandler = async (e: React.FormEvent) => {
		e.preventDefault();
		const typed = text.trim();
		if (typed && (typed.length < 2 || typed.length > 50)) return sweetMixinErrorAlert(t('search.textRule'));
		setSearch({ ...search, text: typed || undefined });
	};

	return (
		<div className="searchbar">
			<h1>{t('search.title')}</h1>
			<p>{t('search.subtitle')}</p>
			<form className="row" onSubmit={searchHandler}>
				<input
					className="field"
					value={text}
					maxLength={50}
					onChange={(e) => setText(e.target.value)}
					placeholder={t('home.searchPlaceholder')}
				/>
				<select
					className="field"
					value={search.brandList?.length === 1 ? search.brandList[0] : ''}
					onChange={(e) => setSearch({ ...search, brandList: e.target.value ? [e.target.value as CarBrand] : undefined, modelList: undefined })}
				>
					<option value="">{t('home.allBrands')}</option>
					{Object.values(CarBrand).map((b) => (
						<option key={b} value={b}>
							{t(`enum.${b}`)}
						</option>
					))}
				</select>
				<select
					className="field"
					value={search.locationList?.length === 1 ? search.locationList[0] : ''}
					onChange={(e) => setSearch({ ...search, locationList: e.target.value ? [e.target.value as CarLocation] : undefined })}
				>
					<option value="">{t('search.allKorea')}</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{t(`enum.${l}`)}
						</option>
					))}
				</select>
				<button className="btn primary">{t('search.search')}</button>
			</form>
		</div>
	);
};

export default HeaderFilter;
