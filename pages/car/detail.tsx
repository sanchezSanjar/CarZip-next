import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CarPhoto from '../../libs/components/common/CarPhoto';
import Heart from '../../libs/components/common/Heart';
import Verified from '../../libs/components/common/Verified';
import ContactList from '../../libs/components/car/ContactList';
import CarCard from '../../libs/components/common/CarCard';
import { sampleComments } from '../../libs/sampleData';
import { GET_CAR, GET_CARS, GET_MEMBER } from '../../apollo/user/query';
import { Car, Cars } from '../../libs/types/car/car';
import { Member } from '../../libs/types/member/member';
import { userVar } from '../../apollo/store';
import { useLikeCar } from '../../libs/hooks/useLikeCar';
import { sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { CarMarket, CarOption } from '../../libs/enums/car.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { colorHex, dealerName, enumLabel, formatManwon, formatNumber, formatUsd, initial, marketLabel, timeAgo } from '../../libs/utils';

const CarDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const carId = typeof router.query.id === 'string' ? router.query.id : '';
	const [photoIndex, setPhotoIndex] = useState(0);
	const [comment, setComment] = useState('');
	const likeCarHandler = useLikeCar();

	/** APOLLO REQUESTS **/
	const { data: getCarData, loading: getCarLoading, error: getCarError } = useQuery<{ getCar: Car }>(GET_CAR, {
		fetchPolicy: 'cache-and-network',
		variables: { input: carId },
		skip: !carId,
	});
	const car = getCarData?.getCar;
	const dealerId = car?.memberId ?? '';

	const { data: getMemberData } = useQuery<{ getMember: Member }>(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: dealerId },
		skip: !dealerId,
	});
	const dealer = getMemberData?.getMember;

	const { data: dealerCarsData } = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { limit: 4, search: { agentId: dealerId } } },
		skip: !dealerId,
	});
	const moreCars = (dealerCarsData?.getCars.list ?? []).filter((c) => c._id !== carId).slice(0, 3);

	if (!router.isReady || (getCarLoading && !car)) {
		return <div className="wrap muted">Loading the car…</div>;
	}
	if (getCarError || !car) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>This car isn&apos;t available</h3>
					<p>It may have been sold or removed by the dealer.</p>
					<Link href="/car" className="btn dark">
						Browse cars
					</Link>
				</div>
			</div>
		);
	}

	const photos = car.carImages.length ? car.carImages : ['', '', '', '', ''];
	const age = Math.max(1, new Date().getFullYear() - car.carYear);
	const perYear = Math.round(car.carMileage / age);
	const odometer = String(car.carMileage).padStart(6, '0').split('');
	const firstDigit = odometer.findIndex((d) => d !== '0');

	return (
		<>
			<div className="crumbs">
				<Link href="/car" style={{ color: 'inherit' }}>
					Buy a car
				</Link>{' '}
				/ {enumLabel(car.carBrand)} / <b>{car.carModel}</b>
			</div>
			<div className="detail">
				<div>
					<div className="gallery">
						<CarPhoto image={photos[photoIndex]} type={car.carType} color={car.carColor} />
						<div className="thumbs">
							{photos.slice(0, 5).map((p, i) => (
								<div key={i} onClick={() => setPhotoIndex(i)} style={{ cursor: 'pointer' }}>
									<CarPhoto image={p} type={car.carType} color={car.carColor} className={i === photoIndex ? 'on' : ''} />
								</div>
							))}
						</div>
					</div>
					<div className="dtitle">
						<h1>{car.carTitle}</h1>
						<div className="meta">
							<span>Listed {timeAgo(car.createdAt)}</span>
							<span>
								<b className="num" style={{ color: 'var(--asphalt)' }}>
									{formatNumber(car.carViews)}
								</b>{' '}
								views
							</span>
							<span>
								<b className="num" style={{ color: 'var(--asphalt)' }}>
									{car.carLikes}
								</b>{' '}
								likes
							</span>
							<span>
								<b className="num" style={{ color: 'var(--asphalt)' }}>
									{car.carComments}
								</b>{' '}
								comments
							</span>
						</div>
					</div>
					<div className="odo-wrap">
						<div className="l">
							<b>Mileage</b>as reported by the dealer
						</div>
						<div className="odo">
							{odometer.map((d, i) => (
								<span key={i} className={i < firstDigit ? 'dim' : ''}>
									{d}
								</span>
							))}
							<em>km</em>
						</div>
						<div className="avg">
							<b className="num">{formatNumber(perYear)} km / year</b>
							{perYear < 15000 ? 'below' : 'above'} the 15,000 km average
						</div>
					</div>
					<div className="specgrid">
						<div>
							<small>Year</small>
							<b className="num">{car.carYear}</b>
						</div>
						<div>
							<small>Fuel</small>
							<b>{enumLabel(car.carFuelType)}</b>
						</div>
						<div>
							<small>Transmission</small>
							<b>{enumLabel(car.carTransmission)}</b>
						</div>
						<div>
							<small>Color</small>
							<b>
								<i className="sw" style={{ width: 16, height: 16, background: colorHex[car.carColor] }} />
								{enumLabel(car.carColor)}
							</b>
						</div>
						<div>
							<small>Condition</small>
							<b>{enumLabel(car.carCondition)}</b>
						</div>
						<div>
							<small>Body type</small>
							<b>{enumLabel(car.carType)}</b>
						</div>
						<div>
							<small>Location</small>
							<b>{enumLabel(car.carLocation)}</b>
						</div>
						<div>
							<small>Viewing address</small>
							<b>{car.carAddress}</b>
						</div>
					</div>
					{car.carOptions.length > 0 && (
						<div className="section">
							<h2>
								Features{' '}
								<span>
									{car.carOptions.length} of {Object.values(CarOption).length}
								</span>
							</h2>
							<div className="opts">
								{car.carOptions.map((o) => (
									<div key={o}>{enumLabel(o)}</div>
								))}
							</div>
						</div>
					)}
					{car.carDesc && (
						<div className="section">
							<h2>From the dealer</h2>
							<p className="desc">{car.carDesc}</p>
						</div>
					)}
					<div className="section">
						<h2>
							Comments <span className="num">{car.carComments}</span>
						</h2>
						<div className="comment-box">
							<div className="avatar user">{initial(user.memberNick || 'G')}</div>
							<textarea
								className="ta"
								style={{ border: 0, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
								placeholder={user._id ? 'Ask the dealer something about this car' : 'Log in to write a comment'}
								value={comment}
								disabled={!user._id}
								onChange={(e) => setComment(e.target.value)}
							/>
							<button className="btn dark sm" disabled={!user._id || !comment.trim()}>
								Post comment
							</button>
						</div>
						{sampleComments.map((c) => (
							<div key={c._id} className="comment">
								<div className={`avatar ${c.dealer ? '' : 'user'}`}>{initial(c.nick)}</div>
								<div>
									<div className="who">
										{c.nick} {c.dealer && <span className="role">Dealer</span>} <small>{timeAgo(c.when)}</small>
									</div>
									<p>{c.text}</p>
								</div>
							</div>
						))}
					</div>
				</div>
				<aside className="side">
					<div className="panel">
						{car.carMarket !== CarMarket.EXPORT ? (
							<>
								<div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Price</div>
								<div className="bigprice">
									{formatManwon(car.carPrice)}
									<small>만원</small>
								</div>
								{car.carMarket === CarMarket.BOTH && (
									<div className="usdline">
										<span>Export price</span>
										<b className="num">{formatUsd(car.carPriceUsd)}</b>
									</div>
								)}
							</>
						) : (
							<>
								<div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Export price</div>
								<div className="bigprice">{formatUsd(car.carPriceUsd)}</div>
							</>
						)}
						<div className="deals">
							<div className="deal">
								<span>Sold for</span>
								<b>{marketLabel[car.carMarket]}</b>
							</div>
							<div className="deal">
								<span>Rent</span>
								{car.carRent ? (
									<b>
										<span className="num">{formatNumber(car.carRentPrice)}</span>원 per day
									</b>
								) : (
									<span className="no">Not offered</span>
								)}
							</div>
							<div className="deal">
								<span>Barter</span>
								{car.carBarter ? <b>Open to offers</b> : <span className="no">Not offered</span>}
							</div>
						</div>
						<div className="acts">
							<button className="btn ghost" onClick={() => likeCarHandler(car._id)}>
								<Heart filled={!!car.meLiked?.[0]?.myFavorite} /> {car.meLiked?.[0]?.myFavorite ? 'Liked' : 'Like'}{' '}
								<span className="num">{car.carLikes}</span>
							</button>
							<button
								className="btn ghost"
								onClick={async () => {
									await navigator.clipboard.writeText(window.location.href);
									await sweetTopSuccessAlert('Link copied', 1000);
								}}
							>
								Share
							</button>
						</div>
					</div>
					<div className="panel">
						<div className="agent-head">
							<div className="avatar">{initial(dealerName(car.agentData))}</div>
							<div>
								<Link href={`/agent/detail?id=${car.agentData?._id}`} style={{ color: 'inherit' }}>
									<h3>{dealerName(car.agentData)}</h3>
								</Link>
								<Verified />
							</div>
							<button className="btn ghost sm" style={{ marginLeft: 'auto' }}>
								Follow
							</button>
						</div>
						<div className="agent-stats">
							<span>
								<b className="num">{dealer?.memberCars ?? '–'}</b> cars for sale
							</span>
							<span>
								<b className="num">{dealer?.memberFollowers ?? '–'}</b> followers
							</span>
							{dealer && (
								<span>
									Since <b>{new Date(dealer.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</b>
								</span>
							)}
						</div>
						<ContactList dealer={car.agentData} />
						<p className="note">Payment and fees are agreed directly with the dealer. CarZip does not handle money.</p>
					</div>
					{car.carMarket !== CarMarket.DOMESTIC && (
						<div className="exportnote">
							<b>Buying for export?</b>The dealer is fully responsible for the export: deregistration (말소등록), export
							paperwork, customs, shipping and payment. CarZip is only a marketplace and is not part of the deal. The USD price
							is set by the dealer, not converted by CarZip.
						</div>
					)}
					{car.carTestDrive && user.memberType !== MemberType.AGENT && (
						<div className="panel td">
							<h3>Book a test drive</h3>
							<div className="sub">The dealer confirms or declines. You get a notification either way.</div>
							<div className="two">
								<input className="field" type="date" />
								<input className="field" type="time" defaultValue="10:30" />
							</div>
							<textarea className="field ta2" placeholder="Message to the dealer (optional)" maxLength={300} />
							<button className="btn primary" style={{ width: '100%' }} disabled={!user._id}>
								{user._id ? 'Request test drive' : 'Log in to book a test drive'}
							</button>
						</div>
					)}
				</aside>
			</div>
			{moreCars.length > 0 && (
				<div style={{ padding: '0 48px 56px' }}>
					<div className="section" style={{ marginTop: 0 }}>
						<h2>
							More from {dealerName(car.agentData)}
							<Link href={`/agent/detail?id=${dealerId}`} style={{ fontSize: 14, fontWeight: 600, marginLeft: 'auto' }}>
								See all
							</Link>
						</h2>
					</div>
					<div className="grid3">
						{moreCars.map((c) => (
							<CarCard key={c._id} car={c} />
						))}
					</div>
				</div>
			)}
		</>
	);
};

export default withLayoutBasic(CarDetail, 'Car | CarZip');
