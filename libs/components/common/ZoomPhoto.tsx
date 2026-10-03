import React, { useRef, useState } from 'react';

const ZOOM = 2.5; // how much the square magnifies
const LENS = 220; // the square's size in px

interface Lens {
	x: number;
	y: number;
	bgWidth: number;
	bgHeight: number;
	bgX: number;
	bgY: number;
}

/**
 * A car photo shown whole; hovering it shows a square magnifier that follows the mouse
 * and shows the spot under it 2.5x bigger. Nothing happens on touch screens (no hover there).
 */
const ZoomPhoto = ({ image }: { image: string }) => {
	const imgRef = useRef<HTMLImageElement>(null);
	const [lens, setLens] = useState<Lens | null>(null);

	const move = (e: React.MouseEvent) => {
		const img = imgRef.current;
		if (!img?.naturalWidth) return;
		// the photo is shown whole inside the frame (grey around it): find where the photo itself sits
		const frame = img.getBoundingClientRect();
		const scale = Math.min(frame.width / img.naturalWidth, frame.height / img.naturalHeight);
		const width = img.naturalWidth * scale;
		const height = img.naturalHeight * scale;
		const left = (frame.width - width) / 2;
		const top = (frame.height - height) / 2;
		const x = e.clientX - frame.left;
		const y = e.clientY - frame.top;
		// over the grey area: no magnifier
		if (x < left || x > left + width || y < top || y > top + height) return setLens(null);
		setLens({
			x,
			y,
			bgWidth: width * ZOOM,
			bgHeight: height * ZOOM,
			bgX: LENS / 2 - (x - left) * ZOOM,
			bgY: LENS / 2 - (y - top) * ZOOM,
		});
	};

	return (
		<div className="photo real zoomable" onMouseMove={move} onMouseLeave={() => setLens(null)}>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img ref={imgRef} src={image} alt="" />
			{lens && (
				<div
					className="zoom-lens"
					style={{
						left: lens.x - LENS / 2,
						top: lens.y - LENS / 2,
						width: LENS,
						height: LENS,
						backgroundImage: `url(${image})`,
						backgroundSize: `${lens.bgWidth}px ${lens.bgHeight}px`,
						backgroundPosition: `${lens.bgX}px ${lens.bgY}px`,
					}}
				/>
			)}
		</div>
	);
};

export default ZoomPhoto;
