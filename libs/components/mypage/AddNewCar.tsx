import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_AGENT_CARS, GET_CAR_CATALOG } from '../../../apollo/user/query';
import { CREATE_CAR, UPDATE_CAR } from '../../../apollo/user/mutation';
import { Car, CarCatalogBrand } from '../../types/car/car';
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
import { colorHex } from '../../utils';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const markets = [
	{ value: CarMarket.DOMESTIC, title: 'add.koreaOnly', desc: 'add.koreaOnlyText' },
	{ value: CarMarket.EXPORT, title: 'car.exportOnly', desc: 'add.exportOnlyText' },
	{ value: CarMarket.BOTH, title: 'add.both', desc: 'add.bothText' },
];

/** dealer: list a new car. A new listing is for sale right away */
const MAX_PHOTOS = 20;

/** list a new car, or edit `car` when given (the same form, filled in) */
const AddNewCar = ({ car }: { car?: Car }) => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const editing = !!car;
	const router = useRouter();
	const [photos, setPhotos] = useState<UploadedImage[]>(car?.carImages.map((url) => ({ url, thumbnailUrl: url })) ?? []);
	const [uploading, setUploading] = useState(false);
	const [publishing, setPublishing] = useState(false);
	const [brand, setBrand] = useState<CarBrand | ''>(car?.carBrand ?? '');
	const [model, setModel] = useState(car?.carModel ?? '');
	const [year, setYear] = useState(car ? String(car.carYear) : '');
	const [mileage, setMileage] = useState(car ? String(car.carMileage) : '');
	const [type, setType] = useState<CarType | ''>(car?.carType ?? '');
	const [transmission, setTransmission] = useState<CarTransmission | ''>(car?.carTransmission ?? '');
	const [condition, setCondition] = useState<CarCondition | ''>(car?.carCondition ?? '');
	const [fuel, setFuel] = useState<CarFuelType | ''>(car?.carFuelType ?? '');
	const [color, setColor] = useState<CarColor | ''>(car?.carColor ?? '');
	const [options, setOptions] = useState<CarOption[]>(car?.carOptions ?? []);
	const [market, setMarket] = useState<CarMarket | ''>(car?.carMarket ?? '');
	const [priceManwon, setPriceManwon] = useState(car?.carPrice ? String(Math.round(car.carPrice / 10000)) : '');
	const [priceUsd, setPriceUsd] = useState(car?.carPriceUsd ? String(car.carPriceUsd) : '');
	const [exportAgreed, setExportAgreed] = useState(!!car?.carExportAgreedAt);
	const [rent, setRent] = useState(car?.carRent ?? false);
	const [rentPrice, setRentPrice] = useState(car?.carRentPrice ? String(car.carRentPrice) : '');
	const [barter, setBarter] = useState(car?.carBarter ?? false);
	const [testDrive, setTestDrive] = useState(car?.carTestDrive ?? true);
	const [title, setTitle] = useState(car?.carTitle ?? '');
	const [location, setLocation] = useState<CarLocation | ''>(car?.carLocation ?? '');
	const [address, setAddress] = useState(car?.carAddress ?? '');
	const [desc, setDesc] = useState(car?.carDesc ?? '');

	const needsKrw = market === CarMarket.DOMESTIC || market === CarMarket.BOTH;
	const needsUsd = market === CarMarket.EXPORT || market === CarMarket.BOTH;
	const exportOnly = market === CarMarket.EXPORT;

	/** APOLLO REQUESTS **/
	const { data: catalogData } = useQuery<{ getCarCatalog: CarCatalogBrand[] }>(GET_CAR_CATALOG, { fetchPolicy: 'cache-first' });
	const [createCar] = useMutation<{ createCar: { _id: string } }>(CREATE_CAR, { refetchQueries: [GET_AGENT_CARS] });
	const [updateCar] = useMutation(UPDATE_CAR, { refetchQueries: [GET_AGENT_CARS] });
	// brand OTHER takes a typed model; every other brand picks from the catalog
	const models = brand && brand !== CarBrand.OTHER ? catalogData?.getCarCatalog.find((c) => c.brand === brand)?.models : undefined;

	// what still needs the dealer's attention, in plain words
	const problems: string[] = [];
	if (!photos.length) problems.push(t('add.pPhotos'));
	if (!brand) problems.push(t('add.pBrand'));
	if (!model.trim()) problems.push(t('add.pModel'));
	if (!year) problems.push(t('add.pYear'));
	if (mileage === '') problems.push(t('add.pMileage'));
	if (!type || !transmission || !condition || !fuel || !color) problems.push(t('add.pDetails'));
	if (!market) problems.push(t('add.pMarket'));
	if (needsKrw && !(Number(priceManwon) > 0)) problems.push(t('add.pKrw'));
	if (needsUsd && !(Number(priceUsd) > 0)) problems.push(t('add.pUsd'));
	if (needsUsd && !exportAgreed) problems.push(t('add.pAgree'));
	if (rent && !exportOnly && !(Number(rentPrice) > 0)) problems.push(t('add.pRent'));
	if (title.trim().length < 5) problems.push(t('add.pTitle'));
	if (!location) problems.push(t('add.pCity'));
	if (address.trim().length < 3) problems.push(t('add.pAddress'));

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
			if (car) {
				// the server checks the whole car again after the change
				await updateCar({ variables: { input: { _id: car._id, ...input } } });
				await sweetTopSuccessAlert(t('add.changesSaved'), 1500);
				await router.push(`/car/detail?id=${car._id}`);
			} else {
				const { data } = await createCar({ variables: { input } });
				await sweetTopSuccessAlert(t('add.published'), 1500);
				await router.push(data ? `/car/detail?id=${data.createCar._id}` : '/mypage?category=myCars');
			}
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
					<h1>{editing ? t('add.editTitle') : t('my.listCar')}</h1>
					<p>
						{editing
							? t('add.editSub')
							: t('add.newSub')}
					</p>
				</div>
				<Link href="/mypage?category=myCars" className="btn ghost">
					{t('my.cancel')}
				</Link>
			</div>

			<div className="formsec">
				<h2>{t('add.photos')}</h2>
				<p>{t('add.photosText')}</p>
				<div className="upgrid">
					{photos.map((p, i) => (
						<div key={p.url} className="upslot">
							{i === 0 && <span className="cover">{t('add.cover')}</span>}
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={p.thumbnailUrl || p.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
							<div className="slot-acts">
								{i > 0 && (
									<button type="button" onClick={() => makeCover(i)}>
										{t('add.cover')}
									</button>
								)}
								<button type="button" onClick={() => setPhotos(photos.filter((_, k) => k !== i))}>
									{t('add.remove')}
								</button>
							</div>
						</div>
					))}
					{photos.length < MAX_PHOTOS && (
						<label className="upslot add" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
							{uploading ? (
								t('my.uploading')
							) : (
								<>
									{t('add.addPhotos')}
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
				<h2>{t('add.brandH')}</h2>
				<p>{t('add.brandText')}</p>
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
							<b>{t(`enum.${b}`)}</b>
						</span>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>{t('add.modelH')}</h2>
				<p>{models ? t('add.modelPick') : t('add.modelType')}</p>
				{models ? (
					<div className="chips">
						{models.map((m) => (
							<span key={m} className={`chip ${model === m ? 'on' : ''}`} onClick={() => setModel(m)}>
								{m}
							</span>
						))}
					</div>
				) : (
					<input className="field" style={{ maxWidth: 360 }} maxLength={50} placeholder={t('filter.model')} value={model} onChange={(e) => setModel(e.target.value)} disabled={!brand} />
				)}
			</div>

			<div className="formsec">
				<h2>{t('add.detailsH')}</h2>
				<p>&nbsp;</p>
				<div className="fgrid3">
					<div>
						<div className="label">{t('add.yearL')}</div>
						<select className="field" value={year} onChange={(e) => setYear(e.target.value)}>
							<option value="">{t('detail.year')}</option>
							{carYears.map((y) => (
								<option key={y}>{y}</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">{t('add.mileageL')}</div>
						<input className="field num" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value.replace(/\D/g, ''))} />
						{mileage && <div className="hint">{fmt.number(Number(mileage))} km</div>}
					</div>
					<div>
						<div className="label">{t('detail.bodyType')} *</div>
						<select className="field" value={type} onChange={(e) => setType(e.target.value as CarType)}>
							<option value="">{t('detail.bodyType')}</option>
							{Object.values(CarType).map((v) => (
								<option key={v} value={v}>
									{t(`enum.${v}`)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">{t('detail.transmission')} *</div>
						<select className="field" value={transmission} onChange={(e) => setTransmission(e.target.value as CarTransmission)}>
							<option value="">{t('detail.transmission')}</option>
							{Object.values(CarTransmission).map((v) => (
								<option key={v} value={v}>
									{t(`enum.${v}`)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">{t('detail.condition')} *</div>
						<select className="field" value={condition} onChange={(e) => setCondition(e.target.value as CarCondition)}>
							<option value="">{t('detail.condition')}</option>
							{Object.values(CarCondition).map((c) => (
								<option key={c} value={c}>
									{t(`enum.${c}`)}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className="label" style={{ marginTop: 18 }}>
					{t('detail.fuel')} *
				</div>
				<div className="chips">
					{Object.values(CarFuelType).map((f) => (
						<span key={f} className={`chip ${fuel === f ? 'on' : ''}`} onClick={() => setFuel(f)}>
							{t(`enum.${f}`)}
						</span>
					))}
				</div>
				<div className="label" style={{ marginTop: 18 }}>
					{t('detail.color')} *
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
							{t(`enum.${c}`)}
						</span>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>{t('detail.features')}</h2>
				<p>{t('add.selected', { count: options.length })}</p>
				<div className="optgrid">
					{Object.values(CarOption).map((o) => (
						<label key={o} style={{ cursor: 'pointer' }}>
							<input type="checkbox" checked={options.includes(o)} onChange={() => toggleOption(o)} />
							{t(`enum.${o}`)}
						</label>
					))}
				</div>
			</div>

			<div className="formsec">
				<h2>{t('add.whereH')}</h2>
				<p>{t('add.whereText')}</p>
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
								{t(m.title)} <i className={`radio ${market === m.value ? 'on' : ''}`} />
							</b>
							<p>{t(m.desc)}</p>
						</div>
					))}
				</div>
				{market && (
					<div className="fgrid3">
						{needsKrw && (
							<div>
								<div className="label">{t('add.krwL')}</div>
								<input className="field num" inputMode="numeric" value={priceManwon} onChange={(e) => setPriceManwon(e.target.value.replace(/\D/g, ''))} />
								{priceManwon && <div className="hint">₩{fmt.number(Number(priceManwon) * 10000)}</div>}
							</div>
						)}
						{needsUsd && (
							<div>
								<div className="label">{t('add.usdL')}</div>
								<input className="field num" inputMode="numeric" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value.replace(/\D/g, ''))} />
								<div className="hint">{t('add.usdHint')}</div>
							</div>
						)}
					</div>
				)}
				{needsUsd && (
					<label className="agreebox" style={{ cursor: 'pointer' }}>
						<input type="checkbox" checked={exportAgreed} onChange={(e) => setExportAgreed(e.target.checked)} style={{ marginTop: 4 }} />
						<div>
							<b>{t('add.agreeBold')}</b> {t('add.agreeText')}
						</div>
					</label>
				)}
			</div>

			<div className="formsec">
				<h2>{t('add.otherH')}</h2>
				<p>{t('add.optional')}</p>
				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
					<div className="dealbox">
						<div className="toggle-row">
							{t('filter.forRent')}
							<div className={`tog ${rent ? 'on' : ''}`} onClick={() => !exportOnly && setRent(!rent)} style={exportOnly ? { opacity: 0.4, cursor: 'not-allowed' } : undefined} />
						</div>
						{exportOnly ? (
							<div className="hint" style={{ marginTop: 10 }}>
								{t('add.notExport')}
							</div>
						) : (
							rent && (
								<>
									<div className="label" style={{ marginTop: 12 }}>
										{t('add.perDayL')}
									</div>
									<input className="field num" inputMode="numeric" value={rentPrice} onChange={(e) => setRentPrice(e.target.value.replace(/\D/g, ''))} />
								</>
							)
						)}
					</div>
					<div className="dealbox">
						<div className="toggle-row">
							{t('filter.barter')}
							<div className={`tog ${barter ? 'on' : ''}`} onClick={() => setBarter(!barter)} />
						</div>
						<div className="hint" style={{ marginTop: 10 }}>
							{t('add.barterHint')}
						</div>
					</div>
					<div className="dealbox">
						<div className="toggle-row">
							{t('add.allowTd')}
							<div className={`tog ${testDrive ? 'on' : ''}`} onClick={() => setTestDrive(!testDrive)} />
						</div>
						<div className="hint" style={{ marginTop: 10 }}>
							{t('add.tdHint')}
						</div>
					</div>
				</div>
			</div>

			<div className="formsec">
				<h2>{t('add.titleH')}</h2>
				<p>&nbsp;</p>
				<div className="fgrid">
					<div className="full">
						<div className="label">{t('add.titleL')}</div>
						<input className="field" maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)} />
					</div>
					<div>
						<div className="label">{t('add.city')} *</div>
						<select className="field" value={location} onChange={(e) => setLocation(e.target.value as CarLocation)}>
							<option value="">{t('add.city')}</option>
							{Object.values(CarLocation).map((l) => (
								<option key={l} value={l}>
									{t(`enum.${l}`)}
								</option>
							))}
						</select>
					</div>
					<div>
						<div className="label">{t('add.addressL')}</div>
						<input className="field" maxLength={150} value={address} onChange={(e) => setAddress(e.target.value)} />
					</div>
					<div className="full">
						<div className="label">{t('add.descL')}</div>
						<textarea className="field" maxLength={3000} value={desc} onChange={(e) => setDesc(e.target.value)} />
						<div className="hint">{t('my.charsOf', { count: desc.length, max: fmt.number(3000) })}</div>
					</div>
				</div>
			</div>

			<div className="stickybar">
				<span className="t">
					{problems.length
						? t('add.toFill', { count: problems.length, list: problems.join(', ') })
						: editing
							? t('add.readySave')
							: t('add.readyPublish')}
				</span>
				<button className="btn primary" disabled={problems.length > 0 || publishing || uploading} onClick={publish}>
					{publishing ? t('my.saving') : editing ? t('my.saveChanges') : t('add.publishBtn')}
				</button>
			</div>
		</>
	);
};

export default AddNewCar;
