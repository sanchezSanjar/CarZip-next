import React from 'react';

// sample notices from the UI design; the real list comes from getNotices (category NOTICE)
const notices = [
	{ title: 'Dealer applications are reviewed within 24 hours', date: '20 Sep', pinned: true },
	{ title: 'New: filter cars by features', date: '15 Sep' },
	{ title: 'Scheduled maintenance, 5 Oct 02:00 to 04:00', date: '12 Sep' },
];

const Notice = ({ compact = false }: { compact?: boolean }) => {
	return (
		<div className="sidecard" style={compact ? { marginTop: 18 } : undefined}>
			<h3>Notices</h3>
			{notices.map((n) => (
				<div key={n.title} className="notice-row">
					{n.pinned ? <span className="pin">Pinned</span> : <span className="dot" />}
					{n.title}
					<small>{n.date}</small>
				</div>
			))}
		</div>
	);
};

export default Notice;
