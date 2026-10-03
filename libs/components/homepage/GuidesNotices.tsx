import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_NOTICES } from '../../../apollo/user/query';
import { Notices } from '../../types/notice/notice';
import { NoticeCategory } from '../../enums/notice.enum';
import { Direction } from '../../enums/common.enum';

const guides = [
	{ icon: '🔍', title: "Buyer's guide", text: 'Find a car, check it and contact the dealer.', href: '/cs?tab=faq' },
	{ icon: '🗓', title: 'Test drives', text: 'Request a date; the dealer confirms or declines.', href: '/cs?tab=faq' },
	{ icon: '🌏', title: 'Buying for export', text: 'USD prices, and who handles the paperwork.', href: '/cs?tab=faq' },
	{ icon: '🏁', title: 'Become a dealer', text: 'Apply in minutes; we review within 24 hours.', href: '/account/join?mode=signup&type=AGENT' },
];

/** how-to guides on the left; the latest notices and how to reach us on the right */
const GuidesNotices = () => {
	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getNotices: Notices }>(GET_NOTICES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: Direction.DESC, search: { noticeCategory: NoticeCategory.NOTICE } } },
	});
	const notices = data?.getNotices.list ?? [];

	return (
		<section className="home-section">
			<div className="guides-wrap">
				<div>
					<div className="home-head">
						<div>
							<h2>Guides</h2>
							<p>New to buying used cars in Korea? Start here.</p>
						</div>
					</div>
					<div className="guide-grid">
						{guides.map((g) => (
							<Link key={g.title} href={g.href} className="guide-card">
								<span className="guide-ic">{g.icon}</span>
								<b>{g.title}</b>
								<span>{g.text}</span>
							</Link>
						))}
					</div>
				</div>
				<div className="notice-side">
					<div className="sidecard">
						<h3 style={{ display: 'flex', justifyContent: 'space-between' }}>
							Notices
							<Link href="/cs?tab=notices" style={{ fontSize: 13, fontWeight: 600 }}>
								All
							</Link>
						</h3>
						{notices.length ? (
							notices.map((n) => (
								<Link key={n._id} href="/cs?tab=notices" className="notice-row" style={{ color: 'inherit' }}>
									<span className="dot" />
									{n.noticeTitle}
									<small>{new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>
								</Link>
							))
						) : (
							<p className="muted" style={{ fontSize: 14 }}>
								No notices right now.
							</p>
						)}
					</div>
					<div className="sidecard contact-card">
						<h3>Need help?</h3>
						<p>Our team answers on weekdays, 10:00 to 18:00 (KST).</p>
						<a href="mailto:help@carzip.example.com">help@carzip.example.com</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default GuidesNotices;
