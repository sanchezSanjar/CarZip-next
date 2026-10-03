import React from 'react';
import { useTranslation } from 'next-i18next/pages';

const values = [
	{
		icon: '✓',
		color: 'var(--dealer)',
		tint: 'var(--dealer-tint)',
		title: 'home.value1Title',
		photo: '/img/home/value-verified.webp',
		text: 'home.value1Text',
	},
	{
		icon: '☎',
		color: 'var(--asphalt)',
		tint: 'rgba(245, 166, 35, .18)',
		title: 'home.value2Title',
		photo: '/img/home/value-direct.webp',
		text: 'home.value2Text',
	},
	{
		icon: '✈',
		color: 'var(--road)',
		tint: 'var(--road-tint)',
		title: 'home.value3Title',
		photo: '/img/home/value-export.webp',
		text: 'home.value3Text',
	},
];

/** why CarZip, in three cards, each on a photo */
const ValueCards = () => {
	const { t } = useTranslation('common');
	return (
		<section className="home-section">
			<div className="value-grid">
				{values.map((v) => (
					<div key={v.title} className="value-card has-photo" style={{ backgroundImage: `url(${v.photo})` }}>
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
