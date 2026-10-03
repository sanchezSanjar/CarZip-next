import React from 'react';

const Heart = ({ filled = false }: { filled?: boolean }) => {
	return (
		<svg width="15" height="15" viewBox="0 0 24 24">
			<path
				d="M12 21s-8-5.2-8-11a4.8 4.8 0 0 1 8-3.5A4.8 4.8 0 0 1 20 10c0 5.8-8 11-8 11z"
				fill={filled ? '#D0392B' : 'none'}
				stroke={filled ? '#D0392B' : '#1E242B'}
				strokeWidth="2"
			/>
		</svg>
	);
};

export default Heart;
