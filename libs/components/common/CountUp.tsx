import React, { useEffect, useRef } from 'react';

/**
 * A number that counts up from 0 when it first appears (about 1.2 s, slowing down at the end).
 * The page is built with the final number, so it reads right even before the animation runs.
 */
const CountUp = ({ value, format = (n) => String(n) }: { value: number; format?: (n: number) => string }) => {
	const ref = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el || !value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const start = performance.now();
		const DURATION = 1200;
		let frame = 0;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / DURATION);
			el.textContent = format(Math.round(value * (1 - Math.pow(1 - t, 3))));
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	return <span ref={ref}>{format(value)}</span>;
};

export default CountUp;
