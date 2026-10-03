import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_CAR_CATALOG } from '../../../apollo/user/query';
import { CarBrand, CarColor, CarFuelType, CarLocation, CarMarket, CarOption } from '../../enums/car.enum';
import { CarCatalogBrand } from '../../types/car/car';
import { CarsSearch } from '../../types/car/car.input';
import { carYears } from '../../config';
import { colorHex, enumLabel } from '../../utils';

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
	{ key: 'testDrive', label: 'Can test drive' },
	{ key: 'rent', label: 'Available for rent' },
	{ key: 'barter', label: 'Open to barter' },
] as const;
const markets = [
	{ value: undefined, label: 'All' },
	{ value: CarMarket.DOMESTIC, label: 'Korea' },
	{ value: CarMarket.EXPORT, label: 'Export' },
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
	const [showAllBrands, setShowAllBrands] = useState(false);
	const [showAllOptions, setShowAllOptions] = useState(false);
	const [currency, setCurrency] = useState<'KRW' | 'USD'>(search.priceUsdRange ? 'USD' : 'KRW');
	// the price boxes start from the search (a shared link like ?price=1000-3000 fills them)
	const startRange = search.priceUsdRange ?? search.priceRange;
	const startScale = search.priceUsdRange ? 1 : 10000;
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
		const scale = cur === 'KRW' ? 10000 : 1;
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
				<h4>Sold for</h4>
				<div className="seg">
					{markets.map((m) => (
						<span key={m.label} className={search.market === m.value ? 'on' : ''} onClick={() => update({ market: m.value })}>
							{m.label}
						</span>
					))}
				</div>
				<div className="hint" style={{ marginTop: 6 }}>
					Export includes cars sold both in Korea and abroad.
				</div>
			</div>
			<div className="fgroup">
				<h4>Deal type</h4>
				{dealTypes.map((d) => (
					<div key={d.key} className="toggle-row">
						{d.label}
						<div className={`tog ${search[d.key] ? 'on' : ''}`} onClick={() => update({ [d.key]: search[d.key] ? undefined : true })} />
					</div>
				))}
			</div>
			<div className="fgroup">
				<h4>
					Brand <span>popular in Korea</span>
				</h4>
				<div className="bgrid">
					{(showAllBrands ? Object.values(CarBrand) : popularBrands).map((b) => (
						<span
							key={b}
							className={`btile ${brands.includes(b) ? 'on' : ''}`}
							onClick={() => update({ brandList: toggle(search.brandList, b), modelList: undefined })}
						>
							<b>{enumLabel(b)}</b>
						</span>
					))}
				</div>
				<a
					style={{ fontSize: 13.5, fontWeight: 600, display: 'block', marginTop: 8, cursor: 'pointer' }}
					onClick={() => setShowAllBrands(!showAllBrands)}
				>
					{showAllBrands ? 'Show popular brands' : `Show all ${Object.values(CarBrand).length} brands`}
				</a>
			</div>
			<div className="fgroup">
				<h4>Model</h4>
				<select
					className="field"
					style={{ height: 40 }}
					disabled={!models.length}
					value={search.modelList?.[0] ?? ''}
					onChange={(e) => update({ modelList: e.target.value ? [e.target.value] : undefined })}
				>
					<option value="">{brands.length ? 'Any model' : 'Pick a brand to see its models'}</option>
					{models.map((m) => (
						<option key={m} value={m}>
							{m}
						</option>
					))}
				</select>
			</div>
			<div className="fgroup">
				<h4>
					Price
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
						placeholder={currency === 'KRW' ? 'Min 만원' : 'Min $'}
						value={priceMin}
						onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ''))}
						onBlur={() => applyPrice()}
						onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
					/>
					<input
						className="field"
						inputMode="numeric"
						placeholder={currency === 'KRW' ? 'Max 만원' : 'Max $'}
						value={priceMax}
						onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ''))}
						onBlur={() => applyPrice()}
						onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
					/>
				</div>
				<div className="hint" style={{ marginTop: 6 }}>
					{currency === 'KRW' ? 'Hides export-only cars.' : 'USD shows export prices only.'}
				</div>
			</div>
			<div className="fgroup">
				<h4>
					Mileage <span className="num">{mileage >= MAX_MILEAGE ? 'any' : `up to ${mileage.toLocaleString('en-US')} km`}</span>
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
				<h4>Year</h4>
				<div className="range">
					<select className="field" value={search.yearRange?.start ?? ''} onChange={(e) => setYear('start', e.target.value)}>
						<option value="">From</option>
						{carYears.map((y) => (
							<option key={y}>{y}</option>
						))}
					</select>
					<select className="field" value={search.yearRange?.end ?? ''} onChange={(e) => setYear('end', e.target.value)}>
						<option value="">To</option>
						{carYears.map((y) => (
							<option key={y}>{y}</option>
						))}
					</select>
				</div>
			</div>
			<div className="fgroup">
				<h4>Fuel</h4>
				<div className="chips">
					{Object.values(CarFuelType).map((f) => (
						<span key={f} className={`chip ${search.fuelList?.includes(f) ? 'on' : ''}`} onClick={() => update({ fuelList: toggle(search.fuelList, f) })}>
							{enumLabel(f)}
						</span>
					))}
				</div>
			</div>
			<div className="fgroup">
				<h4>Color</h4>
				<div className="swgrid">
					{Object.values(CarColor)
						.filter((c) => c !== CarColor.OTHER)
						.map((c) => (
							<span key={c} className="swl" onClick={() => update({ colorList: toggle(search.colorList, c) })}>
								<i className={`sw ${search.colorList?.includes(c) ? 'on' : ''}`} style={{ background: colorHex[c] }} />
								{enumLabel(c)}
							</span>
						))}
				</div>
			</div>
			<div className="fgroup">
				<h4>
					Features <span>must have all</span>
				</h4>
				<div className="chips">
					{(showAllOptions ? Object.values(CarOption) : popularOptions).map((o) => (
						<span key={o} className={`chip ${search.optionList?.includes(o) ? 'on' : ''}`} onClick={() => update({ optionList: toggle(search.optionList, o) })}>
							{enumLabel(o)}
						</span>
					))}
					<a
						style={{ fontSize: 13.5, fontWeight: 600, alignSelf: 'center', cursor: 'pointer' }}
						onClick={() => setShowAllOptions(!showAllOptions)}
					>
						{showAllOptions ? 'Show less' : `+${Object.values(CarOption).length - popularOptions.length} more`}
					</a>
				</div>
			</div>
			<div className="fgroup">
				<h4>Location</h4>
				<div className="chips">
					{Object.values(CarLocation).map((l) => (
						<span
							key={l}
							className={`chip ${search.locationList?.includes(l) ? 'on' : ''}`}
							onClick={() => update({ locationList: toggle(search.locationList, l) })}
						>
							{enumLabel(l)}
						</span>
					))}
				</div>
			</div>
			<button className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={clearAll}>
				Clear all filters
			</button>
		</aside>
	);
};

export default Filter;
