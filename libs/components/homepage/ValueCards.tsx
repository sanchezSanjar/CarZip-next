import React from 'react';
import { useTranslation } from 'next-i18next/pages';

const values = [
	{
		icon: '✓',
		color: 'var(--dealer)',
		tint: 'var(--dealer-tint)',
		title: 'home.value1Title',
		text: 'home.value1Text',
	},
	{
		icon: '☎',
		color: 'var(--asphalt)',
		tint: 'rgba(245, 166, 35, .18)',
		title: 'home.value2Title',
		text: 'home.value2Text',
	},
	{
		icon: '✈',
		color: 'var(--road)',
		tint: 'var(--road-tint)',
		title: 'home.value3Title',
		text: 'home.value3Text',
	},
];

/** why CarZip, in three cards */
const ValueCards = () => {
	const { t } = useTranslation('common');
	return (
		<section className="home-section">
			<div className="value-grid">
				{values.map((v) => (
					<div key={v.title} className="value-card">
						<span className="value-ic" style={{ color: v.color, background: v.tint }}>
							{v.icon}
						</span>
						<h3>{t(v.title)}</h3>
						<p>{t(v.text)}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default ValueCards;
