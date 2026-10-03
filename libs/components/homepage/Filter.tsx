import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CAR_CATALOG } from '../../../apollo/user/query';
import { CarBrand, CarColor, CarFuelType, CarLocation, CarMarket, CarOption } from '../../enums/car.enum';
import { CarCatalogBrand } from '../../types/car/car';
import { CarsSearch } from '../../types/car/car.input';
import { carYears } from '../../config';
import { colorHex } from '../../utils';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const popularBrands = [
	CarBrand.HYUNDAI,
	CarBrand.KIA,
	CarBrand.GENESIS,
	CarBrand.CHEVROLET,
	CarBrand.KGM,
	CarBrand.RENAULT,
	CarBrand.BMW,
	CarBrand.MERCEDES,
	CarBrand.AUDI,
	CarBrand.VOLKSWAGEN,
	CarBrand.VOLVO,
	CarBrand.TESLA,
];
const popularOptions = [
	CarOption.SUNROOF,
	CarOption.REAR_CAMERA,
	CarOption.HEATED_SEATS,
	CarOption.SMART_KEY,
	CarOption.BLACK_BOX,
	CarOption.AROUND_VIEW,
];
const dealTypes = [
	{ key: 'testDrive', label: 'filter.canTestDrive' },
	{ key: 'rent', label: 'filter.forRent' },
	{ key: 'barter', label: 'filter.barter' },
] as const;
const markets = [
	{ value: undefined, label: 'filter.all' },
	{ value: CarMarket.DOMESTIC, label: 'filter.korea' },
	{ value: CarMarket.EXPORT, label: 'filter.export' },
];
const MAX_MILEAGE = 200000; // slider at the end = any mileage

interface FilterProps {
	search: CarsSearch;
	setSearch: (search: CarsSearch) => void;
}

function toggle<V>(list: V[] | undefined, value: V): V[] {
	const l = list ?? [];
	return l.includes(value) ? l.filter((v) => v !== value) : [...l, value];
}

const toNumber = (v: string) => (v.trim() === '' ? undefined : Number(v.replace(/\D/g, '')));

/** left filter panel of the browse page: every change goes straight into the getCars search */
const Filter = ({ search, setSearch }: FilterProps) => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const krwScale = fmt.locale === 'kr' ? 10000 : 1_000_000; // 만원, or millions of won
	const [showAllBrands, setShowAllBrands] = useState(false);
	const [showAllOptions, setShowAllOptions] = useState(false);
	const [currency, setCurrency] = useState<'KRW' | 'USD'>(search.priceUsdRange ? 'USD' : 'KRW');
	// the price boxes start from the search (a shared link like ?price=1000-3000 fills them)
	const startRange = search.priceUsdRange ?? search.priceRange;
	const startScale = search.priceUsdRange ? 1 : krwScale;
	const [priceMin, setPriceMin] = useState(startRange?.start !== undefined ? String(startRange.start / startScale) : '');
	const [priceMax, setPriceMax] = useState(startRange?.end !== undefined ? String(startRange.end / startScale) : '');
	const [mileage, setMileage] = useState(search.mileageRange?.end ?? MAX_MILEAGE);

	/** APOLLO REQUESTS **/
	const { data: catalogData } = useQuery<{ getCarCatalog: CarCatalogBrand[] }>(GET_CAR_CATALOG, { fetchPolicy: 'cache-first' });
	const brands = search.brandList ?? [];
	const models = (catalogData?.getCarCatalog ?? []).filter((c) => brands.includes(c.brand)).flatMap((c) => c.models);

	/** HANDLERS **/
	const update = (patch: Partial<CarsSearch>) => setSearch({ ...search, ...patch });

	const applyPrice = (min = priceMin, max = priceMax, cur = currency) => {
		// KRW is typed in 만원 (x 10,000); USD as is
		const scale = cur === 'KRW' ? krwScale : 1;
		const start = toNumber(min);
		const end = toNumber(max);
		const range = start === undefined && end === undefined ? undefined : { start: start === undefined ? undefined : start * scale, end: end === undefined ? undefined : end * scale };
		update(cur === 'KRW' ? { priceRange: range, priceUsdRange: undefined } : { priceUsdRange: range, priceRange: undefined });
	};

	const applyMileage = (value: number) => update({ mileageRange: value >= MAX_MILEAGE ? undefined : { start: 0, end: value } });

	const setYear = (key: 'start' | 'end', value: string) => {
		const yearRange = { ...search.yearRange, [key]: value ? Number(value) : undefined };
		update({ yearRange: yearRange.start === undefined && yearRange.end === undefined ? undefined : yearRange });
	};

	const clearAll = () => {
		setPriceMin('');
		setPriceMax('');
		setMileage(MAX_MILEAGE);
		setSearch({ text: search.text }); // the header search stays
	};

	return (
		<aside className="filters">
			<div className="fgroup">
				<h4>{t('filter.soldFor')}</h4>
				<div className="seg">
					{markets.map((m) => (
						<span key={m.label} className={search.market === m.value ? 'on' : ''} onClick={() => update({ market: m.value })}>
							{t(m.label)}
						</span>
					))}
				</div>
				<div className="hint" style={{ marginTop: 6 }}>
					{t('filter.exportHint')}
				</div>
			</div>
			<div className="fgroup">
				<h4>{t('filter.dealType')}</h4>
				{dealTypes.map((d) => (
					<div key={d.key} className="toggle-row">
						{t(d.label)}
						<div className={`tog ${search[d.key] ? 'on' : ''}`} onClick={() => update({ [d.key]: search[d.key] ? undefined : true })} />
					</div>
				))}
			</div>
			<div className="fgroup">
				<h4>
					{t('filter.brand')} <span>{t('filter.popularKorea')}</span>
				</h4>
				<div className="bgrid">
					{(showAllBrands ? Object.values(CarBrand) : popularBrands).map((b) => (
						<span
							key={b}
							className={`btile ${brands.includes(b) ? 'on' : ''}`}
							onClick={() => update({ brandList: toggle(search.brandList, b), modelList: undefined })}
						>
							<b>{t(`enum.${b}`)}</b>
						</span>
					))}
				</div>
				<a
					style={{ fontSize: 13.5, fontWeight: 600, display: 'block', marginTop: 8, cursor: 'pointer' }}
					onClick={() => setShowAllBrands(!showAllBrands)}
				>
					{showAllBrands ? t('filter.showPopular') : t('filter.showAllBrands', { count: Object.values(CarBrand).length })}
				</a>
			</div>
			<div className="fgroup">
				<h4>{t('filter.model')}</h4>
				<select
					className="field"
					style={{ height: 40 }}
					disabled={!models.length}
					value={search.modelList?.[0] ?? ''}
					onChange={(e) => update({ modelList: e.target.value ? [e.target.value] : undefined })}
				>
					<option value="">{brands.length ? t('filter.anyModel') : t('filter.pickBrand')}</option>
					{models.map((m) => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>
			<div className="fgroup">
				<h4>
					{t('filter.price')}
					<span className="seg sm">
						{(['KRW', 'USD'] as const).map((c) => (
							<span
								key={c}
								className={currency === c ? 'on' : ''}
								onClick={() => {
									setCurrency(c);
									applyPrice(priceMin, priceMax, c);
								}}
							>
								{c}
							</span>
						))}
					</span>
				</h4>
				<div className="range">
					<input
						className="field"
						inputMode="numeric"
						placeholder={currency === 'KRW' ? t('filter.minKrw') : t('filter.minUsd')}
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ''))}
						onBlur={() => applyPrice()}
						onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
					/>
					<input
						className="field"
						inputMode="numeric"
						placeholder={currency === 'KRW' ? t('filter.maxKrw') : t('filter.maxUsd')}
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ''))}
						onBlur={() => applyPrice()}
						onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
					/>
				</div>
				<div className="hint" style={{ marginTop: 6 }}>
					{currency === 'KRW' ? t('filter.hidesExport') : t('filter.usdHint')}
				</div>
			</div>
			<div className="fgroup">
				<h4>
					{t('filter.mileage')} <span className="num">{mileage >= MAX_MILEAGE ? t('filter.anyMileage') : t('filter.upTo', { km: fmt.number(mileage) })}</span>
				</h4>
				<input
					type="range"
					min={10000}
					max={MAX_MILEAGE}
					step={10000}
					value={mileage}
					onChange={(e) => setMileage(Number(e.target.value))}
					onMouseUp={() => applyMileage(mileage)}
					onTouchEnd={() => applyMileage(mileage)}
					onKeyUp={() => applyMileage(mileage)}
					style={{ width: '100%', accentColor: 'var(--road)' }}
				/>
			</div>
			<div className="fgroup">
				<h4>{t('filter.year')}</h4>
				<div className="range">
					<select className="field" value={search.yearRange?.start ?? ''} onChange={(e) => setYear('start', e.target.value)}>
						<option value="">{t('filter.from')}</option>
						{carYears.map((y) => (
							<option key={y}>{y}</option>
						))}
					</select>
					<select className="field" value={search.yearRange?.end ?? ''} onChange={(e) => setYear('end', e.target.value)}>
						<option value="">{t('filter.to')}</option>
						{carYears.map((y) => (
							<option key={y}>{y}</option>
						))}
					</select>
				</div>
			</div>
			<div className="fgroup">
				<h4>{t('filter.fuel')}</h4>
				<div className="chips">
					{Object.values(CarFuelType).map((f) => (
						<span key={f} className={`chip ${search.fuelList?.includes(f) ? 'on' : ''}`} onClick={() => update({ fuelList: toggle(search.fuelList, f) })}>
							{t(`enum.${f}`)}
						</span>
					))}
				</div>
			</div>
			<div className="fgroup">
				<h4>{t('filter.color')}</h4>
				<div className="swgrid">
					{Object.values(CarColor)
						.filter((c) => c !== CarColor.OTHER)
						.map((c) => (
							<span key={c} className="swl" onClick={() => update({ colorList: toggle(search.colorList, c) })}>
								<i className={`sw ${search.colorList?.includes(c) ? 'on' : ''}`} style={{ background: colorHex[c] }} />
								{t(`enum.${c}`)}
							</span>
						))}
				</div>
			</div>
			<div className="fgroup">
				<h4>
					{t('filter.features')} <span>{t('filter.mustHaveAll')}</span>
				</h4>
				<div className="chips">
					{(showAllOptions ? Object.values(CarOption) : popularOptions).map((o) => (
						<span key={o} className={`chip ${search.optionList?.includes(o) ? 'on' : ''}`} onClick={() => update({ optionList: toggle(search.optionList, o) })}>
							{t(`enum.${o}`)}
						</span>
					))}
					<a
						style={{ fontSize: 13.5, fontWeight: 600, alignSelf: 'center', cursor: 'pointer' }}
						onClick={() => setShowAllOptions(!showAllOptions)}
					>
						{showAllOptions ? t('filter.showLess') : t('filter.more', { count: Object.values(CarOption).length - popularOptions.length })}
					</a>
				</div>
			</div>
			<div className="fgroup">
				<h4>{t('filter.location')}</h4>
				<div className="chips">
					{Object.values(CarLocation).map((l) => (
						<span
							key={l}
							className={`chip ${search.locationList?.includes(l) ? 'on' : ''}`}
							onClick={() => update({ locationList: toggle(search.locationList, l) })}
						>
							{t(`enum.${l}`)}
						</span>
					))}
				</div>
			</div>
			<button className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={clearAll}>
				{t('search.clearAll')}
			</button>
		</aside>
	);
};

export default Filter;
