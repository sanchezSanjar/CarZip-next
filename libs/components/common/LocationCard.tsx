import React from 'react';
import { CarLocation } from '../../enums/car.enum';
import { enumLabel } from '../../utils';
import { cities, jejuX, jejuY, outline, px } from '../homepage/KoreaMap';
import MapLinks from './MapLinks';

/** the city an address mentions ("Yangcheon-gu, Seoul" -> SEOUL), if any */
export const cityOf = (address?: string | null): CarLocation | undefined =>
	Object.values(CarLocation).find((c) => address?.toUpperCase().includes(c));

interface LocationCardProps {
	title: string;
	address: string;
	city?: CarLocation;
}

/** where to go: the address, a small map of Korea with the city pinned, and links to Naver / Kakao Map */
const LocationCard = ({ title, address, city }: LocationCardProps) => {
	const pin = city ? px(...cities[city]) : null;
	// the map services find a place better with the city in the search
	const query = city && !address.toUpperCase().includes(city) ? `${address}, ${enumLabel(city)}` : address;

	return (
		<div className="panel location-card">
			<h3>{title}</h3>
			<div className="loc-body">
				<svg className="loc-map" viewBox="60 0 330 420" role="img" aria-label={city ? `Map of Korea, ${enumLabel(city)} marked` : 'Map of Korea'}>
					<path d={outline} className="land" />
					<ellipse cx={jejuX} cy={jejuY} rx="26" ry="11" className="land" />
					{pin && (
						<>
							<circle cx={pin[0]} cy={pin[1]} r="18" className="pulse" />
							<circle cx={pin[0]} cy={pin[1]} r="8" className="pin" />
						</>
					)}
				</svg>
				<div className="loc-text">
					<b>{address}</b>
					{city && <span className="muted">{enumLabel(city)}</span>}
					<MapLinks query={query} />
				</div>
			</div>
		</div>
	);
};

export default LocationCard;
