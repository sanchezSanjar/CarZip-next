import React, { useState } from 'react';
import { CarBrand, CarColor, CarFuelType, CarLocation, CarOption } from '../../enums/car.enum';
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
	{ value: 'ALL', label: 'All' },
	{ value: 'DOMESTIC', label: 'Korea' },
	{ value: 'EXPORT', label: 'Export' },
];

function toggle<V>(list: V[], value: V, set: (l: V[]) => void) {
	set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
}

/** left filter panel of the browse page */
const Filter = () => {
	const [market, setMarket] = useState('ALL');
	const [deal, setDeal] = useState({ testDrive: false, rent: false, barter: false });
	const [brands, setBrands] = useState<CarBrand[]>([]);
	const [showAllBrands, setShowAllBrands] = useState(false);
	const [currency, setCurrency] = useState<'KRW' | 'USD'>('KRW');
	const [mileage, setMileage] = useState(80000);
	const [fuels, setFuels] = useState<CarFuelType[]>([]);
	const [colors, setColors] = useState<CarColor[]>([]);
	const [options, setOptions] = useState<CarOption[]>([]);
	const [showAllOptions, setShowAllOptions] = useState(false);
	const [locations, setLocations] = useState<CarLocation[]>([]);

	const clearAll = () => {
		setMarket('ALL');
		setDeal({ testDrive: false, rent: false, barter: false });
		setBrands([]);
		setFuels([]);
		setColors([]);
		setOptions([]);
		setLocations([]);
		setMileage(80000);
	};

	return (
		<aside className="filters">
			<div className="fgroup">
				<h4>Sold for</h4>
				<div className="seg">
					{markets.map((m) => (
						<span key={m.value} className={market === m.value ? 'on' : ''} onClick={() => setMarket(m.value)}>
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
						<div className={`tog ${deal[d.key] ? 'on' : ''}`} onClick={() => setDeal({ ...deal, [d.key]: !deal[d.key] })} />
					</div>
				))}
			</div>
			<div className="fgroup">
				<h4>
					Brand <span>popular in Korea</span>
				</h4>
				<div className="bgrid">
					{(showAllBrands ? Object.values(CarBrand) : popularBrands).map((b) => (
						<span key={b} className={`btile ${brands.includes(b) ? 'on' : ''}`} onClick={() => toggle(brands, b, setBrands)}>
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
				<select className="field" style={{ height: 40 }} disabled={!brands.length}>
					<option>{brands.length ? 'Any model' : 'Pick a brand to see its models'}</option>
				</select>
			</div>
			<div className="fgroup">
				<h4>
					Price
					<span className="seg sm">
						{(['KRW', 'USD'] as const).map((c) => (
							<span key={c} className={currency === c ? 'on' : ''} onClick={() => setCurrency(c)}>
								{c}
							</span>
						))}
					</span>
				</h4>
				<div className="range">
					<input className="field" placeholder={currency === 'KRW' ? 'Min 만원' : 'Min $'} />
					<input className="field" placeholder={currency === 'KRW' ? 'Max 만원' : 'Max $'} />
				</div>
				<div className="hint" style={{ marginTop: 6 }}>
					USD shows export prices only.
				</div>
			</div>
			<div className="fgroup">
				<h4>
					Mileage <span className="num">up to {mileage.toLocaleString('en-US')} km</span>
				</h4>
				<input
					type="range"
					min={10000}
					max={200000}
					step={10000}
					value={mileage}
					onChange={(e) => setMileage(Number(e.target.value))}
					style={{ width: '100%', accentColor: 'var(--road)' }}
				/>
			</div>
			<div className="fgroup">
				<h4>Year</h4>
				<div className="range">
					<select className="field" defaultValue="">
						<option value="">From</option>
						{carYears.map((y) => (
							<option key={y}>{y}</option>
						))}
					</select>
					<select className="field" defaultValue="">
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
						<span key={f} className={`chip ${fuels.includes(f) ? 'on' : ''}`} onClick={() => toggle(fuels, f, setFuels)}>
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
							<span key={c} className="swl" onClick={() => toggle(colors, c, setColors)}>
								<i className={`sw ${colors.includes(c) ? 'on' : ''}`} style={{ background: colorHex[c] }} />
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
						<span key={o} className={`chip ${options.includes(o) ? 'on' : ''}`} onClick={() => toggle(options, o, setOptions)}>
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
							className={`chip ${locations.includes(l) ? 'on' : ''}`}
							onClick={() => toggle(locations, l, setLocations)}
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
