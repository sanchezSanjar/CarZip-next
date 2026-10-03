import React from 'react';
import { Notice } from '../../types/notice/notice';

/** terms of use and privacy texts published by admins */
const Terms = ({ items }: { items: Notice[] }) => {
	if (!items.length) return <p className="muted">The terms are being prepared.</p>;
	return (
		<>
			{items.map((t) => (
				<div key={t._id} className="sidecard">
					<h3>{t.noticeTitle}</h3>
					<p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
						Updated {new Date(t.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
					</p>
					<p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', lineHeight: 1.7 }}>{t.noticeContent}</p>
				</div>
			))}
		</>
	);
};

export default Terms;
