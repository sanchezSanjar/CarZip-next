import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Faq from '../../libs/components/cs/Faq';
import Notice from '../../libs/components/cs/Notice';
import Terms from '../../libs/components/cs/Terms';
import { useQuery } from '@apollo/client/react';
import { GET_NOTICES } from '../../apollo/user/query';
import { NoticeCategory } from '../../libs/enums/notice.enum';
import { Notices } from '../../libs/types/notice/notice';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';

const tabs = [
	{ key: 'faq', label: 'cs.faq', category: NoticeCategory.FAQ },
	{ key: 'notices', label: 'cs.notices', category: NoticeCategory.NOTICE },
	{ key: 'terms', label: 'cs.terms', category: NoticeCategory.TERMS },
];

const CS: NextPage = () => {
	const { t } = useTranslation('common');
	const router = useRouter();
	// the open tab lives in the address (/cs?tab=terms), so footer links can open it
	const tab = typeof router.query.tab === 'string' ? router.query.tab : 'faq';
	const setTab = (key: string) => router.push({ pathname: '/cs', query: { tab: key } }, undefined, { shallow: true });
	const [text, setText] = useState('');

	/** APOLLO REQUESTS **/
	// every published entry at once: there are few, and the search box filters them right here
	const { data } = useQuery<{ getNotices: Notices }>(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, sort: 'createdAt' } },
	});
	const all = data?.getNotices.list ?? [];
	const q = text.trim().toLowerCase();
	const of = (category: NoticeCategory) =>
		all.filter((n) => n.noticeCategory === category && (!q || `${n.noticeTitle} ${n.noticeContent}`.toLowerCase().includes(q)));
	const faqs = of(NoticeCategory.FAQ);
	const notices = of(NoticeCategory.NOTICE);
	const terms = of(NoticeCategory.TERMS);

	return (
		<div className="wrap">
			<h1 className="page-title">{t('cs.title')}</h1>
			<p className="page-sub">
				{t('cs.subtitle')}
				{router.locale !== 'en' && ` ${t('cs.contentNote')}`}
			</p>
			<div className="bar">
				<input
					className="field grow"
					placeholder={t('cs.search')}
					value={text}
					onChange={(e) => setText(e.target.value)}
				/>
			</div>
			<div className="helpgrid">
				<div className="helpnav">
					{tabs.map((section) => (
						<a key={section.key} className={tab === section.key ? 'on' : ''} onClick={() => setTab(section.key)}>
							{t(section.label)}
							<small>{of(section.category).length}</small>
						</a>
					))}
				</div>
				<div>
					{tab === 'faq' && (
						<>
							<Faq key={q} items={faqs} />
							<Notice compact items={notices.slice(0, 3)} />
						</>
					)}
					{tab === 'notices' && <Notice items={notices} />}
					{tab === 'terms' && <Terms items={terms} />}
				</div>
			</div>
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(CS, 'title.help');
