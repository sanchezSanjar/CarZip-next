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
import LocationCard from '../../libs/components/common/LocationCard';
import TestDriveBox from '../../libs/components/car/TestDriveBox';
import CarCard from '../../libs/components/common/CarCard';
import CommentSection from '../../libs/components/common/CommentSection';
import FollowButton from '../../libs/components/common/FollowButton';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { GET_CAR, GET_CARS, GET_MEMBER } from '../../apollo/user/query';
import { Car, Cars } from '../../libs/types/car/car';
import { Member } from '../../libs/types/member/member';
import { userVar } from '../../apollo/store';
import { useLikeCar } from '../../libs/hooks/useLikeCar';
import { sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { CarMarket, CarOption, CarStatus } from '../../libs/enums/car.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { colorHex, dealerName } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../libs/hooks/useLocaleFormat';

const CarDetail: NextPage = () => {
	const router = useRouter();
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const addressReady = useAddressReady();
	const user = useReactiveVar(userVar);
	const carId = typeof router.query.id === 'string' ? router.query.id : '';
	const [photoIndex, setPhotoIndex] = useState(0);
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

	if (!addressReady || (getCarLoading && !car)) {
		return <div className="wrap muted">{t('detail.loading')}</div>;
	}
	if (getCarError || !car) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>{t('detail.notAvailable')}</h3>
					<p>{t('detail.notAvailableText')}</p>
					<Link href="/car" className="btn dark">
						{t('detail.browseCars')}
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
					{t('nav.buyCar')}
				</Link>{' '}
				/ {t(`enum.${car.carBrand}`)} / <b>{car.carModel}</b>
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
							<span>{t('detail.listed', { when: fmt.timeAgo(car.createdAt) })}</span>
							<span>{t('count.views', { count: car.carViews })}</span>
							<span>{t('count.likes', { count: car.carLikes })}</span>
							<span>{t('count.comments', { count: car.carComments })}</span>
						</div>
					</div>
					<div className="odo-wrap">
						<div className="l">
							<b>{t('detail.mileage')}</b>{t('detail.reported')}
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
							<b className="num">{t('detail.perYear', { km: fmt.number(perYear) })}</b>
							{perYear < 15000 ? t('detail.below') : t('detail.above')}
						</div>
					</div>
					<div className="specgrid">
						<div>
							<small>{t('detail.year')}</small>
							<b className="num">{car.carYear}</b>
						</div>
						<div>
							<small>{t('detail.fuel')}</small>
							<b>{t(`enum.${car.carFuelType}`)}</b>
						</div>
						<div>
							<small>{t('detail.transmission')}</small>
							<b>{t(`enum.${car.carTransmission}`)}</b>
						</div>
						<div>
							<small>{t('detail.color')}</small>
							<b>
								<i className="sw" style={{ width: 16, height: 16, background: colorHex[car.carColor] }} />
								{t(`enum.${car.carColor}`)}
							</b>
						</div>
						<div>
							<small>{t('detail.condition')}</small>
							<b>{t(`enum.${car.carCondition}`)}</b>
						</div>
						<div>
							<small>{t('detail.bodyType')}</small>
							<b>{t(`enum.${car.carType}`)}</b>
						</div>
						<div>
							<small>{t('detail.location')}</small>
							<b>{t(`enum.${car.carLocation}`)}</b>
						</div>
						<div>
							<small>{t('detail.address')}</small>
							<b>{car.carAddress}</b>
						</div>
					</div>
					{car.carOptions.length > 0 && (
						<div className="section">
							<h2>
								{t('detail.features')}{' '}
								<span>
									{t('detail.featuresOf', { count: car.carOptions.length, total: Object.values(CarOption).length })}
								</span>
							</h2>
							<div className="opts">
								{car.carOptions.map((o) => (
									<div key={o}>{t(`enum.${o}`)}</div>
								))}
							</div>
						</div>
					)}
					{car.carDesc && (
						<div className="section">
							<h2>{t('detail.fromDealer')}</h2>
							<p className="desc">{car.carDesc}</p>
						</div>
					)}
					<CommentSection group={CommentGroup.CAR} refId={car._id} ownerId={car.memberId} placeholder={t('detail.askDealer')} />
				</div>
				<aside className="side">
					<div className="panel">
						{car.carMarket !== CarMarket.EXPORT ? (
							<>
								<div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>{t('detail.price')}</div>
								<div className="bigprice">
									{fmt.krw(car.carPrice).value}
									<small>{fmt.krw(car.carPrice).unit}</small>
								</div>
								{car.carMarket === CarMarket.BOTH && (
									<div className="usdline">
										<span>{t('detail.exportPrice')}</span>
										<b className="num">{fmt.usd(car.carPriceUsd)}</b>
									</div>
								)}
							</>
						) : (
							<>
								<div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>{t('detail.exportPrice')}</div>
								<div className="bigprice">{fmt.usd(car.carPriceUsd)}</div>
							</>
						)}
						<div className="deals">
							<div className="deal">
								<span>{t('detail.soldFor')}</span>
								<b>{t(`enum.${car.carMarket}`)}</b>
							</div>
							<div className="deal">
								<span>{t('detail.rent')}</span>
								{car.carRent ? (
									<b>
										{t('detail.perDay', { price: fmt.number(car.carRentPrice) })}
									</b>
								) : (
									<span className="no">Not offered</span>
								)}
							</div>
							<div className="deal">
								<span>{t('detail.barter')}</span>
								{car.carBarter ? <b>{t('detail.openToOffers')}</b> : <span className="no">{t('detail.notOffered')}</span>}
							</div>
						</div>
						<div className="acts">
							<button className="btn ghost" onClick={() => likeCarHandler(car._id)}>
								<Heart filled={!!car.meLiked?.[0]?.myFavorite} /> {car.meLiked?.[0]?.myFavorite ? t('detail.liked') : t('detail.like')}{' '}
								<span className="num">{car.carLikes}</span>
							</button>
							<button
								className="btn ghost"
								onClick={async () => {
									await navigator.clipboard.writeText(window.location.href);
									await sweetTopSuccessAlert(t('detail.linkCopied'), 1000);
								}}
							>
								{t('detail.share')}
							</button>
						</div>
					</div>
					<div className="panel">
						<div className="agent-head">
							<Avatar image={car.agentData?.memberImage} dealer />
							<div>
								<Link href={`/agent/detail?id=${car.agentData?._id}`} style={{ color: 'inherit' }}>
									<h3>{dealerName(car.agentData)}</h3>
								</Link>
								<Verified />
							</div>
							<span style={{ marginLeft: 'auto' }}>
								<FollowButton dealerId={dealerId} />
							</span>
						</div>
						<div className="agent-stats">
							<span>
								{t('count.carsForSale', { count: dealer?.memberCars ?? 0 })}
							</span>
							<span>
								{t('count.followers', { count: dealer?.memberFollowers ?? 0 })}
							</span>
							{dealer && (
								<span>
									{t('detail.since')} <b>{fmt.date(dealer.createdAt, { month: 'short', year: 'numeric' })}</b>
								</span>
							)}
						</div>
						<ContactList dealer={car.agentData} />
						<p className="note">{t('detail.paymentNote')}</p>
					</div>
					<LocationCard title={t('detail.whereToSee')} address={car.carAddress} city={car.carLocation} />
					{car.carMarket !== CarMarket.DOMESTIC && (
						<div className="exportnote">
							<b>{t('detail.exportTitle')}</b>{t('detail.exportText')}
						</div>
					)}
					{car.carTestDrive && car.carStatus === CarStatus.ACTIVE && (!user._id || user.memberType === MemberType.USER) && (
						<TestDriveBox carId={car._id} />
					)}
				</aside>
			</div>
			{moreCars.length > 0 && (
				<div style={{ padding: '0 48px 56px' }}>
					<div className="section" style={{ marginTop: 0 }}>
						<h2>
							{t('detail.moreFrom', { name: dealerName(car.agentData) })}
							<Link href={`/agent/detail?id=${dealerId}`} style={{ fontSize: 14, fontWeight: 600, marginLeft: 'auto' }}>
								{t('detail.seeAll')}
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

export const getStaticProps = withTranslations;

export default withLayoutBasic(CarDetail, 'Car | CarZip');
