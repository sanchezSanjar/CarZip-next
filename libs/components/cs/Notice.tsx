import React, { useState } from 'react';
import { Notice as NoticeItem } from '../../types/notice/notice';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

/** service notices, newest first; click one to read it */
const Notice = ({ items, compact = false }: { items: NoticeItem[]; compact?: boolean }) => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const [openId, setOpenId] = useState<string | null>(null);

	return (
		<div className="sidecard" style={compact ? { marginTop: 18 } : undefined}>
			<h3>{t('cs.notices')}</h3>
			{!items.length && <p className="muted">{t('cs.noNotices')}</p>}
			{items.map((n) => (
				<div key={n._id}>
					<div className="notice-row" role="button" style={{ cursor: 'pointer' }} onClick={() => setOpenId(openId === n._id ? null : n._id)}>
						<span className="dot" />
						{n.noticeTitle}
						<small>{fmt.date(n.createdAt, { day: 'numeric', month: 'short', year: 'numeric' })}</small>
					</div>
					{openId === n._id && <p style={{ whiteSpace: 'pre-line', color: 'var(--ink-2)', padding: '0 0 14px 22px', lineHeight: 1.7 }}>{n.noticeContent}</p>}
				</div>
			))}
		</div>
	);
};

export default Notice;
