import React from 'react';
import Link from 'next/link';
import { Car } from '../../types/car/car';
import { CarMarket, CarStatus } from '../../enums/car.enum';
import { dealerName, enumLabel, formatManwon, formatNumber, formatUsd, initial } from '../../utils';
import CarPhoto from './CarPhoto';
import Heart from './Heart';

interface CarCardProps {
	car: Car;
	mine?: boolean; // "Your car" badge for the dealer's own cars
	likeCarHandler?: (carId: string) => void;
}

const CarCard = ({ car, mine = false, likeCarHandler }: CarCardProps) => {
	const liked = !!car.meLiked?.[0]?.myFavorite;
	const sold = car.carStatus === CarStatus.SOLD;
	const badges: string[] = [];
	if (car.carTestDrive) badges.push('Test drive');
	if (car.carRent) badges.push('Rent');
	if (car.carBarter) badges.push('Barter');

	return (
		<div className={`card car-card ${sold ? 'gone' : ''}`}>
			<Link href={`/car/detail?id=${car._id}`} style={{ color: 'inherit' }}>
				<CarPhoto image={car.carImages[0]} type={car.carType} color={car.carColor}>
					<div className="badges">
						{mine && <span className="mine">Your car</span>}
						{car.carMarket !== CarMarket.DOMESTIC && (
							<span className="mk">{car.carMarket === CarMarket.EXPORT ? 'Export only' : 'Export OK'}</span>
						)}
						{badges.map((b) => (
							<span key={b}>{b}</span>
						))}
					</div>
					{sold && <div className="soldover">Sold</div>}
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
				<div className="trim">{enumLabel(car.carBrand)} {car.carModel}</div>
				<div className="specs">
					<span className="num">{car.carYear}</span>
					<span className="num">{formatNumber(car.carMileage)} km</span>
					<span>{enumLabel(car.carFuelType)}</span>
					<span>{car.carTransmission === 'AUTOMATIC' ? 'Auto' : 'Manual'}</span>
				</div>
				<div className="pricebox">
					{car.carMarket === CarMarket.EXPORT ? (
						<>
							<div className="price">{formatUsd(car.carPriceUsd)}</div>
							<div className="usd">Export only, no KRW price</div>
						</>
					) : (
						<>
							<div className="price">
								{formatManwon(car.carPrice)}
								<small>만원</small>
							</div>
							<div className="usd">
								{car.carMarket === CarMarket.BOTH ? `Export price ${formatUsd(car.carPriceUsd)}` : ' '}
							</div>
						</>
					)}
				</div>
			</div>
			<div className="foot">
				<div className="avatar">{initial(dealerName(car.agentData))}</div>
				<b>{dealerName(car.agentData)}</b>
				<span className="loc">{enumLabel(car.carLocation)}</span>
			</div>
		</div>
	);
};

export default CarCard;
