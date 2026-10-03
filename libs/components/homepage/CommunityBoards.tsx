import React from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { BoardArticles } from '../../types/board-article/board-article';
import { Direction } from '../../enums/common.enum';
import { dealerName } from '../../utils';
import Avatar from '../common/Avatar';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

/** the three newest articles from dealers */
const CommunityBoards = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
					<h2>{t('home.community')}</h2>
					<p>{t('home.communityText')}</p>
				</div>
				<Link href="/community" className="btn ghost sm">
					{t('home.allArticles')}
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
								<span>{t(`enum.${a.articleCategory}`)}</span>
							)}
						</div>
						<div className="article-body">
							<span className="cat">{t(`enum.${a.articleCategory}`)}</span>
							<h3>{a.articleTitle}</h3>
							<p>{a.articleContent}</p>
							<div className="by">
								<Avatar image={a.memberData?.memberImage} dealer={!!a.memberData?.agentCompany} />
								{dealerName(a.memberData)}
								<span className="muted" style={{ marginLeft: 'auto' }}>
									{fmt.timeAgo(a.createdAt)} · {t('home.views', { count: a.articleViews })}
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
