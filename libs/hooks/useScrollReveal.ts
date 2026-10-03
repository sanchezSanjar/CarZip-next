import { useEffect } from 'react';

// what fades in: welcome-page sections and the cards in every list
const SELECTOR = '.home-section, .car-card, .dcard, .article-card, .value-card, .post';

/**
 * Sections and cards fade up into place the first time they scroll into view.
 * Cards that arrive later (search results, "show more") are picked up too.
 * Nothing moves for people whose device asks for reduced motion, and without JavaScript everything is simply shown.
 */
export const useScrollReveal = () => {
	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

		const seen = new WeakSet<Element>();
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					e.target.classList.add('in');
					io.unobserve(e.target);
				}
			},
			{ rootMargin: '0px 0px -40px 0px' },
		);
		const scan = () => {
			document.querySelectorAll(SELECTOR).forEach((el) => {
				if (seen.has(el)) return;
				seen.add(el);
				// cards next to each other start a little after one another
				const index = Array.prototype.indexOf.call(el.parentElement?.children ?? [], el);
				(el as HTMLElement).style.setProperty('--reveal-delay', `${(index % 4) * 70}ms`);
				el.classList.add('reveal');
				io.observe(el);
			});
		};
		scan();
		const mo = new MutationObserver(scan); // new cards after a search, a page change or "show more"
		mo.observe(document.body, { childList: true, subtree: true });
		return () => {
			io.disconnect();
			mo.disconnect();
		};
	}, []);
};
