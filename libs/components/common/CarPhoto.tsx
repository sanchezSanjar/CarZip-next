import React from 'react';
import { CarColor, CarType } from '../../enums/car.enum';
import { colorHex } from '../../utils';

// drawn car used when a listing has no photo yet (same drawing as the UI design)
const SHAPES = {
	sedan: {
		body: 'M18,92 C20,79 36,73 66,69 L106,49 C119,41 140,37 170,37 L204,38 C222,39 236,45 250,57 L268,69 C290,72 302,77 304,88 L304,97 L18,97 Z',
		glass: 'M116,52 L136,43 C146,40 158,39 170,39 L199,40 C213,41 225,47 235,57 L240,65 L104,65 Z',
	},
	suv: {
		body: 'M16,94 L18,70 C20,62 29,58 43,56 L78,33 C84,29 93,27 105,27 L232,27 C246,27 256,33 264,45 L279,62 C295,64 305,70 305,84 L305,97 L16,97 Z',
		glass: 'M88,36 C93,32 99,31 107,31 L228,31 C238,31 246,36 252,46 L260,58 L74,58 Z',
	},
	hatch: {
		body: 'M22,94 C22,78 32,70 58,66 L96,40 C104,34 116,30 132,30 L214,30 C230,30 240,38 250,52 L262,70 C284,74 298,80 298,90 L298,97 L22,97 Z',
		glass: 'M106,42 C112,37 120,34 132,34 L210,34 C222,34 230,40 237,52 L243,62 L90,62 Z',
	},
};

const shapeOf = (type?: CarType): keyof typeof SHAPES => {
	if (type === CarType.SUV || type === CarType.VAN || type === CarType.TRUCK) return 'suv';
	if (type === CarType.HATCHBACK) return 'hatch';
	return 'sedan';
};

export const CarSvg = ({ type, color }: { type?: CarType; color?: CarColor }) => {
	const shape = shapeOf(type);
	const s = SHAPES[shape];
	const c = color && color !== CarColor.OTHER ? colorHex[color] : '#BCC1C6';
	const stroke = color === CarColor.WHITE ? '#AEB4B0' : 'rgba(0,0,0,.25)';
	return (
		<svg className="car" viewBox="0 0 320 122" xmlns="http://www.w3.org/2000/svg">
			<ellipse cx="160" cy="112" rx="150" ry="7" fill="rgba(0,0,0,.14)" />
			<path d={s.body} fill={c} stroke={stroke} strokeWidth="1.5" />
			<path d={s.glass} fill="#2B3540" opacity=".82" />
			<line x1="170" y1={shape === 'sedan' ? 40 : 32} x2="170" y2={shape === 'sedan' ? 64 : 58} stroke={c} strokeWidth="4" />
			<rect x={shape === 'hatch' ? 280 : 292} y="76" width="10" height="5" rx="2" fill="#F5A623" />
			<g>
				<circle cx="80" cy="97" r="21" fill="#1E242B" />
				<circle cx="80" cy="97" r="10" fill="#9AA1A8" />
			</g>
			<g>
				<circle cx="244" cy="97" r="21" fill="#1E242B" />
				<circle cx="244" cy="97" r="10" fill="#9AA1A8" />
			</g>
		</svg>
	);
};

interface CarPhotoProps {
	image?: string;
	type?: CarType;
	color?: CarColor;
	className?: string;
	children?: React.ReactNode;
}

/** a listing photo, or the drawn car when there is none */
const CarPhoto = ({ image, type, color, className = '', children }: CarPhotoProps) => {
	if (image) {
		return (
			<div className={`photo real ${className}`}>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={image} alt="" />
				{children}
			</div>
		);
	}
	return (
		<div className={`photo ${className}`}>
			<CarSvg type={type} color={color} />
			{children}
		</div>
	);
};

export default CarPhoto;
