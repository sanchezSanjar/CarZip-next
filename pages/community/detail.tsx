import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Heart from '../../libs/components/common/Heart';
import CarCard from '../../libs/components/common/CarCard';
import CarPhoto from '../../libs/components/common/CarPhoto';
import { sampleArticles, sampleCars } from '../../libs/sampleData';
import { userVar } from '../../apollo/store';
import { CarColor, CarType } from '../../libs/enums/car.enum';
import { dealerName, enumLabel, formatNumber, initial, timeAgo } from '../../libs/utils';

const ArticleDetail: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const article = sampleArticles.find((a) => a._id === router.query.id) ?? sampleArticles[0];
	const more = sampleArticles.filter((a) => a.memberId === article.memberId && a._id !== article._id);
	const [comment, setComment] = useState('');

	return (
		<div className="wrap" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40 }}>
			<div className="article">
				<div className="crumbs" style={{ padding: 0 }}>
					<Link href="/community" style={{ color: 'inherit' }}>
						Community
					</Link>{' '}
					/ <b>{enumLabel(article.articleCategory)}</b>
				</div>
				<h1>{article.articleTitle}</h1>
				<div className="authorbar">
					<div className="avatar" style={{ width: 42, height: 42, fontSize: 17 }}>
						{initial(dealerName(article.memberData))}
					</div>
					<div>
						<b>{dealerName(article.memberData)}</b> {article.memberData?.agentCompany && <span className="role">Dealer</span>}
						<div className="muted" style={{ fontSize: 13 }}>
							{timeAgo(article.createdAt)}, {formatNumber(article.articleViews)} views
						</div>
					</div>
					<button className="btn dark sm" style={{ marginLeft: 'auto' }}>
						Follow
					</button>
				</div>
				<div className="content">
					{/* plain text from the API: React escapes it, line breaks are kept by CSS */}
					<p style={{ whiteSpace: 'pre-line' }}>{article.articleContent}</p>
					{article.articleImage ? (
						<CarPhoto image={article.articleImage} />
					) : (
						<CarPhoto type={CarType.SUV} color={CarColor.GRAY} />
					)}
				</div>
				<div className="reactbar">
					<button className="btn ghost">
						<Heart filled={!!article.meLiked?.[0]?.myFavorite} /> Like <span className="num">{article.articleLikes}</span>
					</button>
					<button className="btn ghost">Share</button>
				</div>
				<div className="section">
					<h2>
						Comments <span className="num">{article.articleComments}</span>
					</h2>
					<div className="comment-box">
						<div className="avatar user">{initial(user.memberNick || 'G')}</div>
						<textarea
							className="ta"
							style={{ border: 0, outline: 'none', resize: 'none', fontFamily: 'inherit' }}
							placeholder={user._id ? 'Write a comment' : 'Log in to write a comment'}
							value={comment}
							disabled={!user._id}
							onChange={(e) => setComment(e.target.value)}
						/>
						<button className="btn dark sm" disabled={!user._id || !comment.trim()}>
							Post comment
						</button>
					</div>
				</div>
			</div>
			<aside>
				{more.length > 0 && (
					<div className="sidecard">
						<h3>More from {dealerName(article.memberData)}</h3>
						{more.map((a) => (
							<div key={a._id} className="toprow">
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									{a.articleTitle}
								</Link>
							</div>
						))}
					</div>
				)}
				<CarCard car={sampleCars[0]} />
			</aside>
		</div>
	);
};

export default withLayoutBasic(ArticleDetail, 'Article | CarZip');
