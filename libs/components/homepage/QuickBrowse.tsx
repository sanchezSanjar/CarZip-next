import React, { useState } from 'react';
import Link from 'next/link';
import { CarBrand, CarFuelType, CarType } from '../../enums/car.enum';

import { useTranslation } from 'next-i18next/pages';

const tabs = [
	{
		key: 'brand',
		label: 'home.tabBrand',
		field: 'carBrand',
		values: Object.values(CarBrand).filter((b) => b !== CarBrand.OTHER),
	},
	{ key: 'type', label: 'home.tabType', field: 'carType', values: Object.values(CarType) },
	{ key: 'fuel', label: 'home.tabFuel', field: 'carFuelType', values: Object.values(CarFuelType) },
] as const;

interface QuickBrowseProps {
	count: (field: 'carBrand' | 'carType' | 'carFuelType') => Record<string, number>;
	total: number;
}

/** right under the hero: pick a brand, body type or fuel and see how many cars there are */
const QuickBrowse = ({ count, total }: QuickBrowseProps) => {
	const { t } = useTranslation('common');
	const [tab, setTab] = useState<(typeof tabs)[number]['key']>('brand');
	const current = tabs.find((t) => t.key === tab)!;
	const counts = count(current.field);
	// values with cars first, then the rest; keep the catalog order inside each group
	const values = [...current.values].sort((a, b) => Number(!counts[a]) - Number(!counts[b]));

	return (
		<section className="home-section quick">
			<div className="home-head">
				<div>
					<h2>{t('home.browseCars', { count: total })}</h2>
					<p>{t('home.browseText')}</p>
				</div>
				<div className="seg" style={{ width: 'auto' }}>
					{tabs.map((tab) => (
						<span
							key={tab.key}
							className={current.key === tab.key ? 'on' : ''}
							style={{ padding: '6px 18px' }}
							onClick={() => setTab(tab.key)}
						>
							{t(tab.label)}
						</span>
					))}
				</div>
			</div>
			<div className="quick-grid">
				{values.map((v) => (
					<Link key={v} href={`/car?${tab}=${v}`} className={`quick-tile ${counts[v] ? '' : 'none'}`}>
						<b>{t(`enum.${v}`)}</b>
						<span className="num">{counts[v] ?? 0}</span>
					</Link>
				))}
			</div>
		</section>
	);
};

export default QuickBrowse;
