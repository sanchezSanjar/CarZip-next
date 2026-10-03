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
import { dealerName, enumLabel, formatNumber, timeAgo } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';
import { useAddressReady } from '../../libs/hooks/useAddressReady';

const CARS_PAGE = 8;

const AgentDetail: NextPage = () => {
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

	if (!addressReady || (memberLoading && !agent)) return <div className="wrap muted">Loading the dealer…</div>;
	if (error || !agent || agent.memberType !== MemberType.AGENT) {
		return (
			<div className="wrap">
				<div className="empty">
					<h3>This dealer isn&apos;t available</h3>
					<p>The account may be under review or closed.</p>
					<Link href="/agent" className="btn dark">
						All dealers
					</Link>
				</div>
			</div>
		);
	}

	/** HANDLERS **/
	const liked = !!agent.meLiked?.[0]?.myFavorite;
	const like = async () => {
		if (!user._id) {
			if (await sweetLoginConfirmAlert('Log in to like dealers.')) await router.push('/account/join?mode=login');
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
			? `Unblock ${dealerName(agent)}?`
			: `Block ${dealerName(agent)}? They won't be able to comment on, like, follow or request test drives for your cars. They are not notified.`;
		if (!(await sweetConfirmAlert(question, agent.meBlocked ? 'Unblock' : 'Block', !agent.meBlocked))) return;
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
							<span>{agent.memberAddress || 'Korea'}</span>
							<span>
								<b className="num">{agent.memberCars}</b> for sale
							</span>
							<span>
								<b className="num">{agent.memberFollowers}</b> followers
							</span>
							<span>
								On CarZip since{' '}
								{new Date(agent.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
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
								{agent.meBlocked ? 'Unblock' : 'Block'}
							</button>
						)}
					</div>
				</div>
				<ContactList dealer={{ ...agent, memberImage: agent.memberImage }} bar />
				<div className="tabs">
					{(
						[
							['cars', 'For sale', agent.memberCars],
							['articles', 'Articles', agent.memberArticles],
							['comments', 'Comments', agent.memberComments],
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
						<h3>Selling your own car?</h3>
						<p>{dealerName(agent)} can list and sell it for you. Contact them to agree the fee.</p>
					</div>
					{agent.contactPhone && (
						<a className="btn dark" href={`tel:${agent.contactPhone}`}>
							Call the dealer
						</a>
					)}
				</div>
				{agent.memberAddress && (
					<LocationCard
						title="Visit the lot"
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
								<h3>No cars for sale right now</h3>
								<p>Follow {dealerName(agent)} to hear about new cars first.</p>
							</div>
						</div>
					)}
					{nextCursor && (
						<div className="more" style={{ marginBottom: 40 }}>
							<button className="btn ghost" style={{ width: 260 }} onClick={showMore}>
								Show more cars
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
									<div>
										<span className="cat">{enumLabel(a.articleCategory)}</span>
										<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
											<h3>{a.articleTitle}</h3>
										</Link>
										<p>{a.articleContent}</p>
										<div className="by">
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
					) : (
						<div className="empty">
							<h3>No articles yet</h3>
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
						placeholder={`Ask ${dealerName(agent)} something`}
					/>
				</div>
			)}
		</>
	);
};

export default withLayoutBasic(AgentDetail, 'Dealer | CarZip');
