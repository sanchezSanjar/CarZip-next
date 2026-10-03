import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticles } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';
import { dealerName, enumLabel, formatNumber, initial, timeAgo } from '../../utils';

/** the three newest articles from dealers */
const CommunityBoards = () => {
	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 3, sort: 'createdAt', direction: Direction.DESC } },
	});
	const articles = data?.getBoardArticles.list ?? [];
	if (!articles.length) return null;

	return (
		<section className="home-section">
			<div className="home-head">
				<div>
					<h2>From the community</h2>
					<p>Advice and news from dealers who sell cars every day.</p>
				</div>
				<Link href="/community" className="btn ghost sm">
					All articles
				</Link>
			</div>
			<div className="article-grid">
				{articles.map((a) => (
					<Link key={a._id} href={`/community/detail?id=${a._id}`} className="article-card">
						<div className="article-img">
							{a.articleImage ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={a.articleImage} alt="" />
							) : (
								<span>{enumLabel(a.articleCategory)}</span>
							)}
						</div>
						<div className="article-body">
							<span className="cat">{enumLabel(a.articleCategory)}</span>
							<h3>{a.articleTitle}</h3>
							<p>{a.articleContent}</p>
							<div className="by">
								<div className="avatar">{initial(dealerName(a.memberData))}</div>
								{dealerName(a.memberData)}
								<span className="muted" style={{ marginLeft: 'auto' }}>
									{timeAgo(a.createdAt)} · {formatNumber(a.articleViews)} views
								</span>
							</div>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
};

export default CommunityBoards;
