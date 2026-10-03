import React from 'react';
import { Notice } from '../../types/notice/notice';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

/** terms of use and privacy texts published by admins */
const Terms = ({ items }: { items: Notice[] }) => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	if (!items.length) return <p className="muted">{t('cs.termsPreparing')}</p>;
	return (
		<>
			{items.map((item) => (
				<div key={item._id} className="sidecard">
					<h3>{item.noticeTitle}</h3>
					<p className="muted" style={{ fontSize: 13, marginBottom: 10 }}>
						{t('cs.updated', { date: fmt.date(item.updatedAt, { day: 'numeric', month: 'long', year: 'numeric' }) })}
					</p>
					<p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', lineHeight: 1.7 }}>{item.noticeContent}</p>
				</div>
			))}
		</>
	);
};

export default Terms;
