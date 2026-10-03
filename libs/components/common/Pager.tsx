import React from 'react';

interface PagerProps {
	page: number;
	total: number; // number of pages
	onChange: (page: number) => void;
}

/** page numbers under a list: ‹ 1 2 … 19 › */
const Pager = ({ page, total, onChange }: PagerProps) => {
	if (total <= 1) return null;

	const pages: (number | '…')[] = [];
	for (let i = 1; i <= total; i++) {
		if (i === 1 || i === total || Math.abs(i - page) <= 1) pages.push(i);
		else if (pages[pages.length - 1] !== '…') pages.push('…');
	}

	return (
		<div className="pager">
			<span role="button" style={{ cursor: 'pointer' }} onClick={() => page > 1 && onChange(page - 1)}>
				‹
			</span>
			{pages.map((p, i) =>
				p === '…' ? (
					<span key={`gap${i}`}>…</span>
				) : (
					<span key={p} role="button" className={p === page ? 'on' : ''} style={{ cursor: 'pointer' }} onClick={() => onChange(p)}>
						{p}
					</span>
				),
			)}
			<span role="button" style={{ cursor: 'pointer' }} onClick={() => page < total && onChange(page + 1)}>
				›
			</span>
		</div>
	);
};

export default Pager;
