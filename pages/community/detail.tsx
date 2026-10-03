import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Heart from '../../libs/components/common/Heart';
import CarCard from '../../libs/components/common/CarCard';
import FollowButton from '../../libs/components/common/FollowButton';
import CommentSection from '../../libs/components/common/CommentSection';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLE, GET_BOARD_ARTICLES, GET_CARS } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { getErrorMessage } from '../../libs/auth';
import { sweetLoginConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { BoardArticle, BoardArticles } from '../../libs/types/board-article/board-article';
import { Cars } from '../../libs/types/car/car';
import { dealerName, enumLabel, formatNumber, timeAgo } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';

const ArticleDetail: NextPage = () => {
	const router = useRouter();
	const addressReady = useAddressReady();
	const user = useReactiveVar(userVar);
	const articleId = typeof router.query.id === 'string' ? router.query.id : '';

	/** APOLLO REQUESTS **/
	const { data, loading, error } = useQuery<{ getBoardArticle: BoardArticle }>(GET_BOARD_ARTICLE, {
		fetchPolicy: 'cache-and-network',
		variables: { input: articleId },
		skip: !articleId,
	});
	const article = data?.getBoardArticle;
	const authorId = article?.memberId ?? '';
	const isDealer = !!article?.memberData?.agentCompany;
	const { data: moreData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 4, sort: 'createdAt', search: { memberId: authorId } } },
		skip: !authorId,
	});
	const { data: carsData } = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { limit: 1, sort: 'LIKES', search: { agentId: authorId } } },
		skip: !authorId || !isDealer,
	});
	const [likeArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
	const more = (moreData?.getBoardArticles.list ?? []).filter((a) => a._id !== articleId).slice(0, 3);
	const dealerCar = carsData?.getCars.list[0];

	if (!addressReady || (loading && !article)) return <div className="wrap muted">Loading the article…</div>;
	if (error || !article) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>This article isn&apos;t available</h3>
					<p>It may have been removed.</p>
					<Link href="/community" className="btn dark">
						Back to Community
					</Link>
				</div>
			</div>
		);
	}

	/** HANDLERS **/
	const liked = !!article.meLiked?.[0]?.myFavorite;
	const like = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to like articles.')) await router.push('/account/join?mode=login');
			return;
		}
		try {
			// the API returns the new count; the "liked" flag is refreshed with the article
			await likeArticle({ variables: { input: article._id }, refetchQueries: [GET_BOARD_ARTICLE] });
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const share = async () => {
		await navigator.clipboard.writeText(window.location.href);
		await sweetTopSuccessAlert('Link copied', 1000);
	};

	return (
		<div className="wrap article-layout">
			<div className="article">
				<div className="crumbs" style={{ padding: 0 }}>
					<Link href="/community" style={{ color: 'inherit' }}>
						Community
					</Link>{' '}
					/ <b>{enumLabel(article.articleCategory)}</b>
				</div>
				<h1>{article.articleTitle}</h1>
				<div className="authorbar">
					<Avatar image={article.memberData?.memberImage} dealer={isDealer} style={{ width: 42, height: 42 }} />
					<div>
						{isDealer ? (
							<Link href={`/agent/detail?id=${authorId}`} style={{ color: 'inherit' }}>
								<b>{dealerName(article.memberData)}</b>
							</Link>
						) : (
							<b>{dealerName(article.memberData)}</b>
						)}{' '}
						{isDealer && <span className="role">Dealer</span>}
						<div className="muted" style={{ fontSize: 13 }}>
							{timeAgo(article.createdAt)}, {formatNumber(article.articleViews)} views
						</div>
					</div>
					{isDealer && (
						<span style={{ marginLeft: 'auto' }}>
							<FollowButton dealerId={authorId} className="btn dark sm" />
						</span>
					)}
				</div>
				<div className="content">
					{article.articleImage && (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={article.articleImage} alt="" style={{ width: '100%', borderRadius: 12, margin: '0 0 22px' }} />
					)}
					{/* plain text from the API: React escapes it, CSS keeps the line breaks */}
					<p style={{ whiteSpace: 'pre-line' }}>{article.articleContent}</p>
				</div>
				<div className="reactbar">
					<button className="btn ghost" onClick={like}>
						<Heart filled={liked} /> {liked ? 'Liked' : 'Like'} <span className="num">{article.articleLikes}</span>
					</button>
					<button className="btn ghost" onClick={share}>
						Share
					</button>
				</div>
				<CommentSection group={CommentGroup.ARTICLE} refId={article._id} ownerId={authorId} />
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
								<small>{new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small>
							</div>
						))}
					</div>
				)}
				{dealerCar && (
					<>
						<h3 style={{ fontSize: 15, fontWeight: 800, margin: '4px 0 10px' }}>For sale by {dealerName(article.memberData)}</h3>
						<CarCard car={dealerCar} />
					</>
				)}
			</aside>
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(ArticleDetail, 'Article | CarZip');
