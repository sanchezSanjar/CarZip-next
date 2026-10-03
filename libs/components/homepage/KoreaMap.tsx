import React, { useState } from 'react';
import Link from 'next/link';
import { CarLocation } from '../../enums/car.enum';
import { enumLabel } from '../../utils';

// longitude/latitude -> map coordinates (simple equirectangular projection, good enough at this size)
export const px = (lon: number, lat: number): [number, number] => [(lon - 125.2) * 80, (38.75 - lat) * 72];

// simplified outline of South Korea's mainland, clockwise from the west end of the border
export const outline = [
	[126.68, 37.92], [127.2, 38.3], [128.3, 38.6], [128.6, 38.3], [129.0, 37.7], [129.4, 37.0], [129.45, 36.3], [129.55, 35.9],
	[129.4, 35.5], [129.2, 35.2], [129.0, 35.05], [128.6, 34.9], [128.2, 34.85], [127.8, 34.7], [127.4, 34.6], [126.9, 34.4],
	[126.4, 34.35], [126.25, 34.6], [126.3, 35.0], [126.45, 35.5], [126.65, 35.9], [126.5, 36.3], [126.15, 36.8], [126.5, 37.0],
	[126.7, 37.4], [126.55, 37.7],
]
	.map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon, lat).map((n) => n.toFixed(1)).join(',')}`)
	.join(' ')
	.concat(' Z');
export const [jejuX, jejuY] = px(126.55, 33.38);

// cities close to each other put their label on opposite sides
const labelLeft = new Set<CarLocation>([CarLocation.INCHEON, CarLocation.DAEGU, CarLocation.GWANGJU]);

export const cities: Record<CarLocation, [number, number]> = {
	[CarLocation.SEOUL]: [126.98, 37.57],
	[CarLocation.INCHEON]: [126.62, 37.46],
	[CarLocation.DAEJON]: [127.38, 36.35],
	[CarLocation.DAEGU]: [128.6, 35.87],
	[CarLocation.GYEONGJU]: [129.22, 35.84],
	[CarLocation.BUSAN]: [129.08, 35.18],
	[CarLocation.GWANGJU]: [126.85, 35.16],
	[CarLocation.CHONJU]: [127.15, 35.82],
	[CarLocation.JEJU]: [126.53, 33.5],
};

/** where the cars are: a map of Korea with a dot per city, and the same cities ranked by number of cars */
const KoreaMap = ({ counts }: { counts: Record<string, number> }) => {
	const [hover, setHover] = useState<CarLocation | null>(null);
	const ranked = (Object.keys(cities) as CarLocation[]).sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
	const max = Math.max(1, ...ranked.map((c) => counts[c] ?? 0));

	return (
		<section className="home-section">
			<div className="home-head">
				<div>
					<h2>Cars across Korea</h2>
					<p>Find a dealer near you, from Seoul to Jeju.</p>
				</div>
			</div>
			<div className="korea">
				<svg className="korea-map" viewBox="0 0 400 420" role="img" aria-label="Map of South Korea with the number of cars per city">
					<path d={outline} className="land" />
					<ellipse cx={jejuX} cy={jejuY} rx="26" ry="11" className="land" />
					{(Object.keys(cities) as CarLocation[]).map((c) => {
						const [x, y] = px(...cities[c]);
						const n = counts[c] ?? 0;
						const r = 6 + (n / max) * 10;
						return (
							<Link key={c} href={`/car?location=${c}`} onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)}>
								<circle cx={x} cy={y} r={r + 6} className={`pulse ${hover === c ? 'on' : ''}`} />
								<circle cx={x} cy={y} r={r} className={`city ${n ? '' : 'none'} ${hover === c ? 'on' : ''}`} />
								<text
									x={labelLeft.has(c) ? x - r - 5 : x + r + 5}
									y={y + 4}
									textAnchor={labelLeft.has(c) ? 'end' : 'start'}
									className="label"
								>
									{enumLabel(c)}
								</text>
							</Link>
						);
					})}
				</svg>
				<div className="city-list">
					{ranked.map((c) => (
						<Link
							key={c}
							href={`/car?location=${c}`}
							className={`city-row ${hover === c ? 'on' : ''}`}
							onMouseEnter={() => setHover(c)}
							onMouseLeave={() => setHover(null)}
						>
							<b>{enumLabel(c)}</b>
							<span className="bar">
								<i style={{ width: `${((counts[c] ?? 0) / max) * 100}%` }} />
							</span>
							<span className="num">{counts[c] ?? 0} cars</span>
						</Link>
					))}
				</div>
			</div>
		</section>
	);
};

export default KoreaMap;
