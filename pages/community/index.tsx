import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Pager from '../../libs/components/common/Pager';
import { sampleArticles } from '../../libs/sampleData';
import { userVar } from '../../apollo/store';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { dealerName, enumLabel, formatNumber, initial, timeAgo } from '../../libs/utils';

const Community: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [category, setCategory] = useState<BoardArticleCategory | ''>('');
	const [page, setPage] = useState(1);
	const articles = sampleArticles.filter((a) => !category || a.articleCategory === category);
	const mostRead = [...sampleArticles].sort((a, b) => b.articleViews - a.articleViews).slice(0, 4);
	const canWrite = user.memberType === MemberType.AGENT || user.memberType === MemberType.ADMIN;

	return (
		<div className="wrap">
			<h1 className="page-title">Community</h1>
			<p className="page-sub">Advice and news from dealers. Everyone can read and comment; dealers write the articles.</p>
			<div className="bar">
				<div className="tabs2">
					<span className={`chip ${category === '' ? 'on' : ''}`} onClick={() => setCategory('')}>
						All
					</span>
					{Object.values(BoardArticleCategory).map((c) => (
						<span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>
							{enumLabel(c)}
						</span>
					))}
				</div>
				<div className="grow" />
				<input className="field" style={{ width: 260 }} placeholder="Search articles" />
				<select className="field" style={{ width: 170, fontWeight: 600 }}>
					<option value="createdAt">Newest</option>
					<option value="articleViews">Most viewed</option>
					<option value="articleLikes">Most liked</option>
					<option value="articleComments">Most comments</option>
				</select>
			</div>
			<div className="board">
				<div className="card">
					{articles.map((a) => (
						<div key={a._id} className="post">
							<div>
								<span className="cat">{enumLabel(a.articleCategory)}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									<h3>{a.articleTitle}</h3>
								</Link>
								<p>{a.articleContent}</p>
								<div className="by">
									<div className={`avatar ${a.memberData?.agentCompany ? '' : 'user'}`}>{initial(dealerName(a.memberData))}</div>
									{dealerName(a.memberData)} {a.memberData?.agentCompany && <span className="role">Dealer</span>}
									<span>{timeAgo(a.createdAt)}</span>
								</div>
							</div>
							<div className="st">
								<b>{formatNumber(a.articleViews)}</b> views
								<br />
								<b>{a.articleLikes}</b> likes
								<br />
								<b>{a.articleComments}</b> comments
							</div>
						</div>
					))}
				</div>
				<aside>
					{canWrite ? (
						<div className="sidecard" style={{ background: 'var(--asphalt)', color: '#fff', borderColor: 'var(--asphalt)' }}>
							<h3>Share your knowledge</h3>
							<p style={{ color: '#B9C1C8', fontSize: 14, marginBottom: 14 }}>Your articles appear here and on your dealer page.</p>
							<Link href="/mypage?category=myArticles" className="btn primary sm">
								Write article
							</Link>
						</div>
					) : (
						<div className="sidecard" style={{ background: 'var(--asphalt)', color: '#fff', borderColor: 'var(--asphalt)' }}>
							<h3>Want to write here?</h3>
							<p style={{ color: '#B9C1C8', fontSize: 14, marginBottom: 14 }}>
								Articles are written by verified dealers. Buyers can comment on any article.
							</p>
							<Link href="/account/join?mode=signup&type=AGENT" className="btn primary sm">
								Become a dealer
							</Link>
						</div>
					)}
					<div className="sidecard">
						<h3>Most read this week</h3>
						{mostRead.map((a, i) => (
							<div key={a._id} className="toprow">
								<span className="n">{i + 1}</span>
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									{a.articleTitle}
								</Link>
								<small className="num">{formatNumber(a.articleViews)}</small>
							</div>
						))}
					</div>
				</aside>
			</div>
			<Pager page={page} total={4} onChange={setPage} />
		</div>
	);
};

export default withLayoutBasic(Community, 'Community | CarZip');
