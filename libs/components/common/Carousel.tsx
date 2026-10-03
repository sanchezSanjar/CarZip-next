import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next/pages';

interface CarouselProps {
	/** one element per slide (each slide is usually a row of cards) */
	slides: React.ReactNode[];
	/** turn to the next slide on its own every N ms (paused while the mouse is over it) */
	autoMs?: number;
}

const Arrow = ({ dir }: { dir: 'prev' | 'next' }) => (
	<svg viewBox="0 0 24 24" aria-hidden>
		<path d={dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
	</svg>
);

/** slides with ‹ › arrows on the sides and dots below; the arrows wrap around (after the last comes the first) */
const Carousel = ({ slides, autoMs }: CarouselProps) => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState(0);
	const [paused, setPaused] = useState(false);
	const count = slides.length;
	const current = count ? page % count : 0;

	/** LIFECYCLES **/
	useEffect(() => {
		if (!autoMs || paused || count <= 1) return;
		const timer = setInterval(() => setPage((p) => (p + 1) % count), autoMs);
		return () => clearInterval(timer);
	}, [autoMs, paused, count]);

	const go = (step: number) => setPage((p) => (((p + step) % count) + count) % count);

	return (
		<div className="carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
			<div className="carousel-viewport">
				<div className="carousel-track" style={{ transform: `translateX(-${current * 100}%)` }}>
					{slides.map((slide, i) => (
						<div key={i} className="carousel-slide" aria-hidden={i !== current}>
							{slide}
						</div>
					))}
				</div>
			</div>
			{count > 1 && (
				<>
					<button className="carousel-arrow prev" aria-label={t('nav.prev')} onClick={() => go(-1)}>
						<Arrow dir="prev" />
					</button>
					<button className="carousel-arrow next" aria-label={t('nav.next')} onClick={() => go(1)}>
						<Arrow dir="next" />
					</button>
					<div className="dots">
						{slides.map((_, i) => (
							<button key={i} className={i === current ? 'on' : ''} aria-label={`${i + 1} / ${count}`} onClick={() => setPage(i)} />
						))}
					</div>
				</>
			)}
		</div>
	);
};

export default Carousel;
