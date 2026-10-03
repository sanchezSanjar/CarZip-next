import React from 'react';

const values = [
	{
		icon: '✓',
		color: 'var(--dealer)',
		tint: 'var(--dealer-tint)',
		title: 'Verified dealers only',
		text: 'Every dealer is checked by the CarZip team before listing a single car.',
	},
	{
		icon: '☎',
		color: 'var(--asphalt)',
		tint: 'rgba(245, 166, 35, .18)',
		title: 'Deal directly, no fees',
		text: 'Call, message or book a test drive with the dealer. CarZip never takes a cut.',
	},
	{
		icon: '✈',
		color: 'var(--road)',
		tint: 'var(--road-tint)',
		title: 'In Korea or for export',
		text: 'See KRW and USD prices set by the dealer. Export cars are clearly marked.',
	},
];

/** why CarZip, in three cards */
const ValueCards = () => {
	return (
		<section className="home-section">
			<div className="value-grid">
				{values.map((v) => (
					<div key={v.title} className="value-card">
						<span className="value-ic" style={{ color: v.color, background: v.tint }}>
							{v.icon}
						</span>
						<h3>{v.title}</h3>
						<p>{v.text}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default ValueCards;
