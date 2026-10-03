import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notices } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const guides = [
	{ icon: '🔍', title: 'home.guide1Title', text: 'home.guide1Text', href: '/cs?tab=faq' },
	{ icon: '🗓', title: 'home.guide2Title', text: 'home.guide2Text', href: '/cs?tab=faq' },
	{ icon: '🌏', title: 'home.guide3Title', text: 'home.guide3Text', href: '/cs?tab=faq' },
	{ icon: '🏁', title: 'home.guide4Title', text: 'home.guide4Text', href: '/account/join?mode=signup&type=AGENT' },
];

/** how-to guides on the left; the latest notices and how to reach us on the right */
const GuidesNotices = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getNotices: Notices }>(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 3,
				sort: 'createdAt',
				direction: Direction.DESC,
				search: { noticeCategory: NoticeCategory.NOTICE },
			},
		},
	});
	const notices = data?.getNotices.list ?? [];

	return (
		<section className="home-section">
			<div className="guides-wrap">
				<div>
					<div className="home-head">
						<div>
							<h2>{t('home.guides')}</h2>
							<p>{t('home.guidesText')}</p>
						</div>
					</div>
					<div className="guide-grid">
						{guides.map((g) => (
							<Link key={g.title} href={g.href} className="guide-card">
								<span className="guide-ic">{g.icon}</span>
								<b>{t(g.title)}</b>
								<span>{t(g.text)}</span>
							</Link>
						))}
					</div>
				</div>
				<div className="notice-side">
					<div className="sidecard">
						<h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
							{t('home.notices')}
							<Link href="/cs?tab=notices" style={{ fontSize: 13, fontWeight: 600 }}>
								{t('home.all')}
							</Link>
						</h3>
						{notices.length ? (
							notices.map((n) => (
								<Link key={n._id} href="/cs?tab=notices" className="notice-row" style={{ color: 'inherit' }}>
									<span className="dot" />
									{n.noticeTitle}
									<small>{fmt.date(n.createdAt)}</small>
								</Link>
							))
						) : (
							<p className="muted" style={{ fontSize: 14 }}>
								{t('home.noNotices')}
							</p>
						)}
					</div>
					<div className="sidecard contact-card">
						<h3>{t('home.needHelp')}</h3>
						<p>{t('home.helpText')}</p>
						<a href="mailto:help@carzip.example.com">help@carzip.example.com</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default GuidesNotices;
