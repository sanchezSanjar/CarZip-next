import React from 'react';

/** green "Verified dealer" badge: every ACTIVE agent was checked by an admin */
const Verified = ({ center = false }: { center?: boolean }) => {
	return (
		<span className="verified" style={center ? { justifyContent: 'center', display: 'flex' } : undefined}>
			<svg viewBox="0 0 16 16">
				<path
					fill="currentColor"
					d="M8 0l2 1.6 2.5-.2.8 2.4 2.1 1.4-.8 2.4.8 2.4-2.1 1.4-.8 2.4-2.5-.2L8 16l-2-1.6-2.5.2-.8-2.4L.6 10.8l.8-2.4-.8-2.4 2.1-1.4.8-2.4 2.5.2z"
				/>
				<path d="M4.8 8.2l2.1 2.1 4.3-4.4" stroke="#fff" strokeWidth="1.7" fill="none" />
			</svg>
			Verified dealer
		</span>
	);
};

export default Verified;
