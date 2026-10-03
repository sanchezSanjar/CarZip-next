import React, { useState } from 'react';
import { Notice } from '../../types/notice/notice';

/** questions and answers; the first three start open */
const Faq = ({ items }: { items: Notice[] }) => {
	const [open, setOpen] = useState<string[]>(items.slice(0, 3).map((f) => f._id));
	const toggle = (id: string) => setOpen(open.includes(id) ? open.filter((o) => o !== id) : [...open, id]);

	if (!items.length) return <p className="muted">No questions match.</p>;
	return (
		<div className="faq">
			{items.map((f) => (
				<div key={f._id} className="faq-item">
					<div className="faq-q" role="button" style={{ cursor: 'pointer' }} onClick={() => toggle(f._id)}>
						{f.noticeTitle}
						<span>{open.includes(f._id) ? '−' : '+'}</span>
					</div>
					{/* plain text, shown as text (never as HTML), line breaks kept */}
					{open.includes(f._id) && <div className="faq-a" style={{ whiteSpace: 'pre-line' }}>{f.noticeContent}</div>}
				</div>
			))}
		</div>
	);
};

export default Faq;
