import React, { useState } from 'react';
import { Notice as NoticeItem } from '../../types/notice/notice';

/** service notices, newest first; click one to read it */
const Notice = ({ items, compact = false }: { items: NoticeItem[]; compact?: boolean }) => {
	const [openId, setOpenId] = useState<string | null>(null);

	return (
		<div className="sidecard" style={compact ? { marginTop: 18 } : undefined}>
			<h3>Notices</h3>
			{!items.length && <p className="muted">No notices right now.</p>}
			{items.map((n) => (
				<div key={n._id}>
					<div className="notice-row" role="button" style={{ cursor: 'pointer' }} onClick={() => setOpenId(openId === n._id ? null : n._id)}>
						<span className="dot" />
						{n.noticeTitle}
						<small>{new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
					</div>
					{openId === n._id && <p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', padding: '0 0 14px 22px', lineHeight: 1.7 }}>{n.noticeContent}</p>}
				</div>
			))}
		</div>
	);
};

export default Notice;
