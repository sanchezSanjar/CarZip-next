import React from 'react';
import Link from 'next/link';
import { Car } from '../../types/car/car';
import { CarMarket, CarStatus } from '../../enums/car.enum';
import { dealerName } from '../../utils';
import CarPhoto from './CarPhoto';
import Heart from './Heart';
import Avatar from './Avatar';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

interface CarCardProps {
	car: Car;
	mine?: boolean; // "Your car" badge for the dealer's own cars
	likeCarHandler?: (carId: string) => void;
}

const CarCard = ({ car, mine = false, likeCarHandler }: CarCardProps) => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const liked = !!car.meLiked?.[0]?.myFavorite;
	const sold = car.carStatus === CarStatus.SOLD;
	const badges: string[] = [];
	if (car.carTestDrive) badges.push(t('car.testDrive'));
	if (car.carRent) badges.push(t('car.rent'));
	if (car.carBarter) badges.push(t('car.barter'));

	return (
		<div className={`card car-card ${sold ? 'gone' : ''}`}>
			<Link href={`/car/detail?id=${car._id}`} style={{ color: 'inherit' }}>
				<CarPhoto image={car.carImages[0]} type={car.carType} color={car.carColor}>
					<div className="badges">
						{mine && <span className="mine">{t('car.yourCar')}</span>}
						{car.carMarket !== CarMarket.DOMESTIC && (
							<span className="mk">{t(car.carMarket === CarMarket.EXPORT ? 'car.exportOnly' : 'car.exportOk')}</span>
						)}
						{badges.map((b) => (
							<span key={b}>{b}</span>
						))}
					</div>
					{car.carImages.length > 1 && (
						<span className="photo-count" aria-label={t('car.photoCount', { count: car.carImages.length })}>
							<svg viewBox="0 0 24 24" aria-hidden>
								<path d="M4 7h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1zm8 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
							</svg>
							{car.carImages.length}
						</span>
					)}
					{sold && <div className="soldover">{t('car.sold')}</div>}
				</CarPhoto>
			</Link>
			<div
				className="like"
				role="button"
				onClick={() => likeCarHandler?.(car._id)}
				style={{ cursor: likeCarHandler ? 'pointer' : 'default' }}
			>
				<Heart filled={liked} />
				<span className="num">{car.carLikes}</span>
			</div>
			<div className="body">
				<Link href={`/car/detail?id=${car._id}`} style={{ color: 'inherit' }}>
					<h3>{car.carTitle}</h3>
				</Link>
				<div className="trim">
					{t(`enum.${car.carBrand}`)} {car.carModel}
				</div>
				<div className="specs">
					<span className="num">{car.carYear}</span>
					<span className="num">{fmt.number(car.carMileage)} km</span>
					<span>{t(`enum.${car.carFuelType}`)}</span>
					<span>{t(car.carTransmission === 'AUTOMATIC' ? 'car.auto' : 'car.manual')}</span>
				</div>
				<div className="pricebox">
					{car.carMarket === CarMarket.EXPORT ? (
						<>
							<div className="price">{fmt.usd(car.carPriceUsd)}</div>
							<div className="usd">{t('car.noKrwPrice')}</div>
						</>
					) : (
						<>
							<div className="price">
								{fmt.krw(car.carPrice).value}
								<small>{fmt.krw(car.carPrice).unit}</small>
							</div>
							<div className="usd">
								{car.carMarket === CarMarket.BOTH ? t('car.exportPrice', { price: fmt.usd(car.carPriceUsd) }) : ' '}
							</div>
						</>
					)}
				</div>
			</div>
			<div className="foot">
				<Avatar image={car.agentData?.memberImage} dealer />
				<b>{dealerName(car.agentData)}</b>
				<span className="loc">{t(`enum.${car.carLocation}`)}</span>
			</div>
		</div>
	);
};

export default CarCard;
