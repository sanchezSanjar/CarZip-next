import React from 'react';

interface AvatarProps {
	image?: string | null;
	dealer?: boolean; // dealers get a rounded square, buyers a circle
	className?: string;
	style?: React.CSSProperties;
}

/** neutral person drawing shown when a member has no photo */
export const Silhouette = () => (
	<svg viewBox="0 0 24 24" aria-hidden="true" className="silhouette">
		<circle cx="12" cy="9" r="4.2" />
		<path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7z" />
	</svg>
);

/** a member's photo; a neutral person silhouette when there is none */
const Avatar = ({ image, dealer = false, className = '', style }: AvatarProps) => {
	return (
		<span className={`avatar ${dealer ? '' : 'user'} ${className}`} style={style}>
			{image ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={image} alt="" />
			) : (
				<Silhouette />
			)}
		</span>
	);
};

export default Avatar;
