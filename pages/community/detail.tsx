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
import { dealerName } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../libs/hooks/useLocaleFormat';

const ArticleDetail: NextPage = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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

	if (!addressReady || (loading && !article)) return <div className="wrap muted">{t('board.loading')}</div>;
	if (error || !article) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>{t('board.notAvailable')}</h3>
					<p>{t('board.removed')}</p>
					<Link href="/community" className="btn dark">
						{t('board.back')}
					</Link>
				</div>
			</div>
		);
	}

	/** HANDLERS **/
	const liked = !!article.meLiked?.[0]?.myFavorite;
	const like = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert(t('board.likePrompt'), t('follow.logIn'))) await router.push('/account/join?mode=login');
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
		await sweetTopSuccessAlert(t('detail.linkCopied'), 1000);
	};

	return (
		<div className="wrap article-layout">
			<div className="article">
				<div className="crumbs" style={{ padding: 0 }}>
					<Link href="/community" style={{ color: 'inherit' }}>
						{t('board.title')}
					</Link>{' '}
					/ <b>{t(`enum.${article.articleCategory}`)}</b>
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
						{isDealer && <span className="role">{t('board.dealer')}</span>}
						<div className="muted" style={{ fontSize: 13 }}>
							{fmt.timeAgo(article.createdAt)}, {t('count.views', { count: article.articleViews })}
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
						<Heart filled={liked} /> {liked ? t('detail.liked') : t('detail.like')} <span className="num">{article.articleLikes}</span>
					</button>
					<button className="btn ghost" onClick={share}>
						{t('detail.share')}
					</button>
				</div>
				<CommentSection group={CommentGroup.ARTICLE} refId={article._id} ownerId={authorId} />
			</div>
			<aside>
				{more.length > 0 && (
					<div className="sidecard">
						<h3>{t('board.moreFrom', { name: dealerName(article.memberData) })}</h3>
						{more.map((a) => (
							<div key={a._id} className="toprow">
								<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
									{a.articleTitle}
								</Link>
								<small>{fmt.date(a.createdAt)}</small>
							</div>
						))}
					</div>
				)}
				{dealerCar && (
					<>
						<h3 style={{ fontSize: 15, fontWeight: 800, margin: '4px 0 10px' }}>{t('board.forSaleBy', { name: dealerName(article.memberData) })}</h3>
						<CarCard car={dealerCar} />
					</>
				)}
			</aside>
		</div>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(ArticleDetail, 'title.article');
