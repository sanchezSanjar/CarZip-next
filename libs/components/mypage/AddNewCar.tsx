import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_AGENT_CARS, GET_CAR_CATALOG } from '../../../apollo/user/query';
import { CREATE_CAR } from '../../../apollo/user/mutation';
import { CarCatalogBrand } from '../../types/car/car';
import { CarInput } from '../../types/car/car.input';
import { getErrorMessage } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { UploadedImage, uploadImages } from '../../upload';
import {
	CarBrand,
	CarColor,
	CarCondition,
	CarFuelType,
	CarLocation,
	CarMarket,
	CarOption,
	CarTransmission,
	CarType,
} from '../../enums/car.enum';
import { carYears } from '../../config';
import { colorHex, enumLabel, formatNumber } from '../../utils';

const markets = [
	{ value: CarMarket.DOMESTIC, title: 'Korea only', desc: 'Price in KRW. Rent allowed.' },
	{ value: CarMarket.EXPORT, title: 'Export only', desc: 'Price in USD. No rent.' },
	{ value: CarMarket.BOTH, title: 'Korea and export', desc: 'Both prices. Buyers see both.' },
];

/** dealer: list a new car. A new listing is for sale right away */
const MAX_PHOTOS = 20;

const AddNewCar = () => {
	const router = useRouter();
	const [photos, setPhotos] = useState<UploadedImage[]>([]);
	const [uploading, setUploading] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [brand, setBrand] = useState<CarBrand | ''>('');
	const [model, setModel] = useState('');
	const [year, setYear] = useState('');
	const [mileage, setMileage] = useState('');
	const [type, setType] = useState<CarType | ''>('');
	const [transmission, setTransmission] = useState<CarTransmission | ''>('');
	const [condition, setCondition] = useState<CarCondition | ''>('');
	const [fuel, setFuel] = useState<CarFuelType | ''>('');
	const [color, setColor] = useState<CarColor | ''>('');
	const [options, setOptions] = useState<CarOption[]>([]);
	const [market, setMarket] = useState<CarMarket | ''>('');
	const [priceManwon, setPriceManwon] = useState('');
	const [priceUsd, setPriceUsd] = useState('');
	const [exportAgreed, setExportAgreed] = useState(false);
	const [rent, setRent] = useState(false);
	const [rentPrice, setRentPrice] = useState('');
	const [barter, setBarter] = useState(false);
	const [testDrive, setTestDrive] = useState(true);
	const [title, setTitle] = useState('');
	const [location, setLocation] = useState<CarLocation | ''>('');
	const [address, setAddress] = useState('');
	const [desc, setDesc] = useState('');

	const needsKrw = market === CarMarket.DOMESTIC || market === CarMarket.BOTH;
	const needsUsd = market === CarMarket.EXPORT || market === CarMarket.BOTH;
	const exportOnly = market === CarMarket.EXPORT;

	/** APOLLO REQUESTS **/
	const { data: catalogData } = useQuery<{ getCarCatalog: CarCatalogBrand[] }>(GET_CAR_CATALOG, { fetchPolicy: 'cache-first' });
	const [createCar] = useMutation<{ createCar: { _id: string } }>(CREATE_CAR, { refetchQueries: [GET_AGENT_CARS] });
	// brand OTHER takes a typed model; every other brand picks from the catalog
	const models = brand && brand !== CarBrand.OTHER ? catalogData?.getCarCatalog.find((c) => c.brand === brand)?.models : undefined;

	// what still needs the dealer's attention, in plain words
	const problems: string[] = [];
	if (!photos.length) problems.push('photos');
	if (!brand) problems.push('brand');
	if (!model.trim()) problems.push('model');
	if (!year) problems.push('year');
	if (mileage === '') problems.push('mileage');
	if (!type || !transmission || !condition || !fuel || !color) problems.push('car details');
	if (!market) problems.push('where you sell');
	if (needsKrw && !(Number(priceManwon) > 0)) problems.push('price in Korea');
	if (needsUsd && !(Number(priceUsd) > 0)) problems.push('export price');
	if (needsUsd && !exportAgreed) problems.push('export agreement');
	if (rent && !exportOnly && !(Number(rentPrice) > 0)) problems.push('rent price');
	if (title.trim().length < 5) problems.push('title');
	if (!location) problems.push('city');
	if (address.trim().length < 3) problems.push('viewing address');

	const toggleOption = (o: CarOption) => setOptions(options.includes(o) ? options.filter((x) => x !== o) : [...options, o]);

	/** HANDLERS **/
	const addPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photos.length);
		e.target.value = ''; // the same file can be picked again
		if (!files.length) return;
		setUploading(true);
		try {
			const uploaded = await uploadImages(files, 'car');
			setPhotos((prev) => [...prev, ...uploaded]);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setUploading(false);
		}
	};

	const makeCover = (i: number) => setPhotos([photos[i], ...photos.filter((_, k) => k !== i)]);

	const publish = async () => {
		if (problems.length || publishing) return;
		const input: CarInput = {
			carImages: photos.map((p) => p.url),
			carBrand: brand as CarBrand,
			carModel: model.trim(),
			carYear: Number(year),
			carMileage: Number(mileage),
			carType: type as CarType,
			carTransmission: transmission as CarTransmission,
			carCondition: condition as CarCondition,
			carFuelType: fuel as CarFuelType,
			carColor: color as CarColor,
			carOptions: options,
			carMarket: market as CarMarket,
			carBarter: barter,
			carTestDrive: testDrive,
			carRent: rent && !exportOnly,
			carTitle: title.trim(),
			carLocation: location as CarLocation,
			carAddress: address.trim(),
			carDesc: desc.trim() || undefined,
		};
		if (needsKrw) input.carPrice = Number(priceManwon) * 10000;
		if (needsUsd) {
			input.carPriceUsd = Number(priceUsd);
			input.exportAgreed = exportAgreed;
		}
		if (input.carRent) input.carRentPrice = Number(rentPrice);

		setPublishing(true);
		try {
			const { data } = await createCar({ variables: { input } });
			await sweetTopSuccessAlert('Listing published', 1500);
			await router.push(data ? `/car/detail?id=${data.createCar._id}` : '/mypage?category=myCars');
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		} finally {
			setPublishing(false);
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>List a car</h1>
					<p>Fields marked with an asterisk are required. The listing goes live as soon as you publish.</p>
				</div>
				<Link href="/mypage?category=myCars" className="btn ghost">
					Cancel
				</Link>
			</div>

			<div className="formsec">
				<h2>Photos</h2>
				<p>Up to 20 photos. The first one is the cover. JPG, PNG or WebP, max 10 MB each.</p>
				<div className="upgrid">
					{photos.map((p, i) => (
						<div key={p.url} className="upslot">
							{i === 0 && <span className="cover">Cover</span>}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={p.thumbnailUrl || p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
							<div className="slot-acts">
								{i > 0 && (
									<button type="button" onClick={() => makeCover(i)}>
										Cover
									</button>
								)}
								<button type="button" onClick={() => setPhotos(photos.filter((_, k) => k !== i))}>
									Remove
								</button>
							</div>
						</div>
					))}
					{photos.length < MAX_PHOTOS && (
						<label className="upslot add" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
							{uploading ? (
								'Uploading…'
							) : (
								<>
									+ Add photos
									<br />
									{photos.length}/{MAX_PHOTOS}
								</>
							)}
							<input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={uploading} onChange={addPhotos} />
						</label>
					)}
				</div>
			</div>

			<div className="formsec">
				<h2>1. Brand *</h2>
				<p>Most popular brands in Korea first. Choose Other only if the brand isn&apos;t listed.</p>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
					{Object.values(CarBrand).map((b) => (
						<span
							key={b}
							className={`btile ${brand === b ? 'on' : ''}`}
							style={{ alignItems: 'center', padding: '10px 6px' }}
							onClick={() => {
								setBrand(b);
								setModel('');
							}}
						>
							<b>{enumLabel(b)}</b>
						</span>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>2. Model *</h2>
				<p>{models ? 'Picking from the list makes sure buyers find your car when they filter.' : 'Type the model name.'}</p>
				{models ? (
					<div className="chips">
						{models.map((m) => (
							<span key={m} className={`chip ${model === m ? 'on' : ''}`} onClick={() => setModel(m)}>
								{m}
							</span>
						))}
					</div>
				) : (
					<input className="field" style={{ maxWidth: 360 }} maxLength={50} placeholder="Model" value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} />
				)}
			</div>

			<div className="formsec">
				<h2>3. Year, mileage and details</h2>
				<p>&nbsp;</p>
				<div className="fgrid3">
					<div>
						<div className="label">Year of production *</div>
						<select className="field" value={year} onChange={(e) => setYear(e.target.value)}>
							<option value="">Year</option>
							{carYears.map((y) => (
								<option key={y}>{y}</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">Mileage (km) *</div>
						<input className="field num" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))} />
						{mileage && <div className="hint">{formatNumber(Number(mileage))} km</div>}
					</div>
					<div>
						<div className="label">Body type *</div>
						<select className="field" value={type} onChange={(e) => setType(e.target.value as CarType)}>
							<option value="">Body type</option>
							{Object.values(CarType).map((t) => (
								<option key={t} value={t}>
									{enumLabel(t)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">Transmission *</div>
						<select className="field" value={transmission} onChange={(e) => setTransmission(e.target.value as CarTransmission)}>
							<option value="">Transmission</option>
							{Object.values(CarTransmission).map((t) => (
								<option key={t} value={t}>
									{enumLabel(t)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">Condition *</div>
						<select className="field" value={condition} onChange={(e) => setCondition(e.target.value as CarCondition)}>
							<option value="">Condition</option>
							{Object.values(CarCondition).map((c) => (
								<option key={c} value={c}>
									{enumLabel(c)}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="label" style={{ marginTop: 18 }}>
					Fuel *
				</div>
				<div className="chips">
					{Object.values(CarFuelType).map((f) => (
						<span key={f} className={`chip ${fuel === f ? 'on' : ''}`} onClick={() => setFuel(f)}>
							{enumLabel(f)}
						</span>
					))}
				</div>
				<div className="label" style={{ marginTop: 18 }}>
					Color *
				</div>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
					{Object.values(CarColor).map((c) => (
						<span
							key={c}
							className="swl"
							onClick={() => setColor(c)}
							style={{
								border: `1px solid ${color === c ? 'var(--road)' : 'var(--line)'}`,
								borderRadius: 9,
								padding: '7px 9px',
								background: color === c ? 'var(--road-tint)' : '#fff',
							}}
						>
							<i className="sw" style={{ background: colorHex[c] }} />
							{enumLabel(c)}
						</span>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>Features</h2>
				<p>{options.length} selected. Buyers can filter by these.</p>
				<div className="optgrid">
					{Object.values(CarOption).map((o) => (
						<label key={o} style={{ cursor: 'pointer' }}>
							<input type="checkbox" checked={options.includes(o)} onChange={() => toggleOption(o)} />
							{enumLabel(o)}
						</label>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>Where do you sell this car? *</h2>
				<p>This decides which prices buyers see. You set each price yourself; CarZip never converts currencies.</p>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
					{markets.map((m) => (
						<div
							key={m.value}
							className={`type ${market === m.value ? 'on' : ''}`}
							onClick={() => {
								setMarket(m.value);
								if (m.value === CarMarket.EXPORT) setRent(false); // export-only cars can't be rented
							}}
						>
							<b>
								{m.title} <i className={`radio ${market === m.value ? 'on' : ''}`} />
							</b>
							<p>{m.desc}</p>
						</div>
					))}
				</div>
				{market && (
					<div className="fgrid3">
						{needsKrw && (
							<div>
								<div className="label">Price in Korea (만원) *</div>
								<input className="field num" inputMode="numeric" value={priceManwon} onChange={(e) => setPriceManwon(e.target.value.replace(/\D/g, ''))} />
								{priceManwon && <div className="hint">{formatNumber(Number(priceManwon) * 10000)}원</div>}
							</div>
						)}
						{needsUsd && (
							<div>
								<div className="label">Export price (USD) *</div>
								<input className="field num" inputMode="numeric" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value.replace(/\D/g, ''))} />
								<div className="hint">FOB or ex-works: say which in the description</div>
							</div>
						)}
					</div>
				)}
				{needsUsd && (
					<label className="agreebox" style={{ cursor: 'pointer' }}>
						<input type="checkbox" checked={exportAgreed} onChange={(e) => setExportAgreed(e.target.checked)} style={{ marginTop: 4 }} />
						<div>
							<b>I am fully responsible for the export of this car.</b> This includes deregistration (말소등록), export declaration,
							customs, shipping, payment and any dispute with the buyer. CarZip is only a marketplace and is not a party to the
							sale. *
						</div>
					</label>
				)}
			</div>

			<div className="formsec">
				<h2>Other deals</h2>
				<p>Optional.</p>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
					<div className="dealbox">
						<div className="toggle-row">
							Available for rent
							<div className={`tog ${rent ? 'on' : ''}`} onClick={() => !exportOnly && setRent(!rent)} style={exportOnly ? { opacity: 0.4, cursor: 'not-allowed' } : undefined} />
						</div>
						{exportOnly ? (
							<div className="hint" style={{ marginTop: 10 }}>
								Not for export-only cars.
							</div>
						) : (
							rent && (
								<>
									<div className="label" style={{ marginTop: 12 }}>
										Price per day (원) *
									</div>
									<input className="field num" inputMode="numeric" value={rentPrice} onChange={(e) => setRentPrice(e.target.value.replace(/\D/g, ''))} />
								</>
							)
						)}
					</div>
					<div className="dealbox">
						<div className="toggle-row">
							Open to barter
							<div className={`tog ${barter ? 'on' : ''}`} onClick={() => setBarter(!barter)} />
						</div>
						<div className="hint" style={{ marginTop: 10 }}>
							Buyers can offer their own car as part payment.
						</div>
					</div>
					<div className="dealbox">
						<div className="toggle-row">
							Allow test drives
							<div className={`tog ${testDrive ? 'on' : ''}`} onClick={() => setTestDrive(!testDrive)} />
						</div>
						<div className="hint" style={{ marginTop: 10 }}>
							Buyers can request a date. You confirm or decline.
						</div>
					</div>
				</div>
			</div>

			<div className="formsec">
				<h2>Title, description and location</h2>
				<p>&nbsp;</p>
				<div className="fgrid">
					<div className="full">
						<div className="label">Title * (5 to 100 characters)</div>
						<input className="field" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
					</div>
					<div>
						<div className="label">City *</div>
						<select className="field" value={location} onChange={(e) => setLocation(e.target.value as CarLocation)}>
							<option value="">City</option>
							{Object.values(CarLocation).map((l) => (
								<option key={l} value={l}>
									{enumLabel(l)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">Viewing address *</div>
						<input className="field" maxLength={150} value={address} onChange={(e) => setAddress(e.target.value)} />
					</div>
					<div className="full">
						<div className="label">Description</div>
						<textarea className="field" maxLength={3000} value={desc} onChange={(e) => setDesc(e.target.value)} />
						<div className="hint">{desc.length} of 3,000 characters</div>
					</div>
				</div>
			</div>

			<div className="stickybar">
				<span className="t">
					{problems.length ? `${problems.length} to fill in: ${problems.join(', ')}` : 'Ready to publish'}
				</span>
				<button className="btn primary" disabled={problems.length > 0 || publishing || uploading} onClick={publish}>
					{publishing ? 'Publishing…' : 'Publish listing'}
				</button>
			</div>
		</>
	);
};

export default AddNewCar;
