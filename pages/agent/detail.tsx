import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Verified from '../../libs/components/common/Verified';
import CarCard from '../../libs/components/common/CarCard';
import Heart from '../../libs/components/common/Heart';
import FollowButton from '../../libs/components/common/FollowButton';
import CommentSection from '../../libs/components/common/CommentSection';
import ContactList from '../../libs/components/car/ContactList';
import LocationCard, { cityOf } from '../../libs/components/common/LocationCard';
import { userVar } from '../../apollo/store';
import { GET_BOARD_ARTICLES, GET_CARS, GET_MEMBER } from '../../apollo/user/query';
import { BLOCK_MEMBER, LIKE_TARGET_MEMBER, UNBLOCK_MEMBER } from '../../apollo/user/mutation';
import { useLikeCar } from '../../libs/hooks/useLikeCar';
import { getErrorMessage } from '../../libs/auth';
import { sweetConfirmAlert, sweetLoginConfirmAlert, sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { MemberType } from '../../libs/enums/member.enum';
import { Cars } from '../../libs/types/car/car';
import { BoardArticles } from '../../libs/types/board-article/board-article';
import { Member } from '../../libs/types/member/member';
import { dealerName } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import ArticleThumb from '../../libs/components/common/ArticleThumb';
import { useAddressReady } from '../../libs/hooks/useAddressReady';
import { withTranslations } from '../../libs/i18n';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../libs/hooks/useLocaleFormat';

const CARS_PAGE = 8;

const AgentDetail: NextPage = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const router = useRouter();
	const addressReady = useAddressReady();
	const user = useReactiveVar(userVar);
	const agentId = typeof router.query.id === 'string' ? router.query.id : '';
	const [tab, setTab] = useState<'cars' | 'articles' | 'comments'>('cars');
	const likeCarHandler = useLikeCar();

	/** APOLLO REQUESTS **/
	const {
		data: memberData,
		loading: memberLoading,
		error,
	} = useQuery<{ getMember: Member }>(GET_MEMBER, {
		fetchPolicy: 'cache-and-network',
		variables: { input: agentId },
		skip: !agentId,
	});
	const agent = memberData?.getMember;
	const { data: carsData, fetchMore } = useQuery<{ getCars: Cars }>(GET_CARS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { limit: CARS_PAGE, search: { agentId } } },
		skip: !agentId,
	});
	const { data: articlesData } = useQuery<{ getBoardArticles: BoardArticles }>(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 20, sort: 'createdAt', search: { memberId: agentId } } },
		skip: !agentId,
	});
	const [likeMember] = useMutation(LIKE_TARGET_MEMBER, { refetchQueries: [GET_MEMBER] });
	const [blockMember] = useMutation(BLOCK_MEMBER, { refetchQueries: [GET_MEMBER] });
	const [unblockMember] = useMutation(UNBLOCK_MEMBER, { refetchQueries: [GET_MEMBER] });

	const cars = carsData?.getCars.list ?? [];
	const nextCursor = carsData?.getCars.nextCursor;
	const articles = articlesData?.getBoardArticles.list ?? [];

	if (!addressReady || (memberLoading && !agent)) return <div className="wrap muted">{t('dealers.loading')}</div>;
	if (error || !agent || agent.memberType !== MemberType.AGENT) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>{t('dealers.notAvailable')}</h3>
					<p>{t('dealers.notAvailableText')}</p>
					<Link href="/agent" className="btn dark">
						{t('dealers.allDealers')}
					</Link>
				</div>
			</div>
		);
	}

	/** HANDLERS **/
	const liked = !!agent.meLiked?.[0]?.myFavorite;
	const like = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert(t('dealers.likePrompt'), t('follow.logIn'))) await router.push('/account/join?mode=login');
			return;
		}
		try {
			await likeMember({ variables: { input: agent._id } });
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const toggleBlock = async () => {
		const question = agent.meBlocked
			? t('dealers.unblockQ', { name: dealerName(agent) })
			: t('dealers.blockQ', { name: dealerName(agent) });
		if (!(await sweetConfirmAlert(question, agent.meBlocked ? t('dealers.unblock') : t('dealers.block'), !agent.meBlocked))) return;
		try {
			await (agent.meBlocked ? unblockMember : blockMember)({ variables: { input: agent._id } });
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const showMore = () =>
		nextCursor &&
		fetchMore({
			variables: { input: { limit: CARS_PAGE, cursor: nextCursor, search: { agentId } } },
			updateQuery: (prev, { fetchMoreResult }) => ({
				getCars: { ...fetchMoreResult.getCars, list: [...(prev.getCars?.list ?? []), ...fetchMoreResult.getCars.list] },
			}),
		});

	return (
		<>
			<div className="agent-hero">
				<div className="top">
					<Avatar image={agent.memberImage} dealer className="logo-sq" />
					<div>
						<h1>
							{dealerName(agent)}
							<span className="ko">@{agent.memberNick}</span>
						</h1>
						<div className="facts">
							<Verified />
							<span>{agent.memberAddress || t('dealers.korea')}</span>
							<span>
								{t('count.carsForSale', { count: agent.memberCars })}
							</span>
							<span>
								{t('count.followers', { count: agent.memberFollowers })}
							</span>
							<span>
								{t('dealers.since', { date: fmt.date(agent.createdAt, { month: 'short', year: 'numeric' }) })}
							</span>
						</div>
						{agent.memberDesc && (
							<p style={{ marginTop: 12, color: 'var(--ink-2)', maxWidth: '70ch' }}>{agent.memberDesc}</p>
						)}
					</div>
					<div style={{ display: 'flex', gap: 8 }}>
						<button className="btn ghost" onClick={like}>
							<Heart filled={liked} /> <span className="num">{agent.memberLikes}</span>
						</button>
						<FollowButton dealerId={agent._id} className="btn dark" />
						{agent.meBlocked !== null && agent.meBlocked !== undefined && agent._id !== user._id && (
							<button className="btn danger" onClick={toggleBlock}>
								{agent.meBlocked ? t('dealers.unblock') : t('dealers.block')}
							</button>
						)}
					</div>
				</div>
				<ContactList dealer={{ ...agent, memberImage: agent.memberImage }} bar />
				<div className="tabs">
					{(
						[
							['cars', t('dealers.tabCars'), agent.memberCars],
							['articles', t('dealers.tabArticles'), agent.memberArticles],
							['comments', t('dealers.tabComments'), agent.memberComments],
						] as const
					).map(([key, label, count]) => (
						<span key={key} className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
							{label}
							<em>{count}</em>
						</span>
					))}
				</div>
			</div>

			<div className="agent-info-row">
				<div className="offer">
					<div style={{ flex: 1 }}>
						<h3>{t('dealers.sellingTitle')}</h3>
						<p>{t('dealers.sellingText', { name: dealerName(agent) })}</p>
					</div>
					{agent.contactPhone && (
						<a className="btn dark" href={`tel:${agent.contactPhone}`}>
							{t('dealers.callDealer')}
						</a>
					)}
				</div>
				{agent.memberAddress && (
					<LocationCard
						title={t('detail.visitLot')}
						address={agent.memberAddress}
						city={cityOf(agent.memberAddress) ?? cars[0]?.carLocation}
					/>
				)}
			</div>

			{tab === 'cars' && (
				<>
					{cars.length ? (
						<div className="grid4">
							{cars.map((car) => (
								<CarCard key={car._id} car={car} mine={car.memberId === user._id} likeCarHandler={likeCarHandler} />
							))}
						</div>
					) : (
						<div className="wrap">
							<div className="empty">
								<h3>{t('dealers.noCars')}</h3>
								<p>{t('dealers.followHint', { name: dealerName(agent) })}</p>
							</div>
						</div>
					)}
					{nextCursor && (
						<div className="more" style={{ marginBottom: 40 }}>
							<button className="btn ghost" style={{ width: 260 }} onClick={showMore}>
								{t('search.showMore')}
							</button>
						</div>
					)}
				</>
			)}

			{tab === 'articles' && (
				<div className="wrap">
					{articles.length ? (
						<div className="card">
							{articles.map((a) => (
								<div key={a._id} className="post">
									<ArticleThumb id={a._id} image={a.articleImage} category={a.articleCategory} />
									<div>
										<span className="cat">{t(`enum.${a.articleCategory}`)}</span>
										<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
											<h3>{a.articleTitle}</h3>
										</Link>
										<p>{a.articleContent}</p>
										<div className="by">
											<span>{fmt.timeAgo(a.createdAt)}</span>
										</div>
									</div>
									<div className="st">
										{t('count.views', { count: a.articleViews })}
										<br />
										{t('count.likes', { count: a.articleLikes })}
										<br />
										{t('count.comments', { count: a.articleComments })}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="empty">
							<h3>{t('dealers.noArticles')}</h3>
						</div>
					)}
				</div>
			)}

			{tab === 'comments' && (
				<div className="wrap" style={{ maxWidth: 860 }}>
					<CommentSection
						group={CommentGroup.MEMBER}
						refId={agent._id}
						ownerId={agent._id}
						placeholder={t('dealers.askDealer', { name: dealerName(agent) })}
					/>
				</div>
			)}
		</>
	);
};

export const getStaticProps = withTranslations;

export default withLayoutBasic(AgentDetail, 'title.dealer');
