import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '../../../apollo/user/query';
import { BLOCK_MEMBER, SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { MemberType } from '../../enums/member.enum';
import { Followers, Followings } from '../../types/follow/follow';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { dealerName, initial, timeAgo } from '../../utils';
import Pager from '../common/Pager';

const LIMIT = 10;

/**
 * Only dealers can be followed, so buyers only have "Following".
 * Dealers also see who follows them, can follow dealers back and can block people.
 */
const MyFollows = () => {
	const user = useReactiveVar(userVar);
	const isAgent = user.memberType === MemberType.AGENT;
	const [tab, setTab] = useState<'followers' | 'followings'>(isAgent ? 'followers' : 'followings');
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const { data: followersData } = useQuery<{ getMemberFollowers: Followers }>(GET_MEMBER_FOLLOWERS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: tab === 'followers' ? page : 1, limit: LIMIT, search: { followingId: user._id } } },
		skip: !isAgent || !user._id,
	});
	const { data: followingsData } = useQuery<{ getMemberFollowings: Followings }>(GET_MEMBER_FOLLOWINGS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: tab === 'followings' ? page : 1, limit: LIMIT, search: { followerId: user._id } } },
		skip: !user._id,
	});
	const refetchQueries = [GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS];
	const [subscribe] = useMutation(SUBSCRIBE, { refetchQueries });
	const [unsubscribe] = useMutation(UNSUBSCRIBE, { refetchQueries });
	const [blockMember] = useMutation(BLOCK_MEMBER, { refetchQueries });

	const followers = followersData?.getMemberFollowers.list ?? [];
	const followings = followingsData?.getMemberFollowings.list ?? [];
	const followersTotal = followersData?.getMemberFollowers.metaCounter?.[0]?.total ?? 0;
	const followingsTotal = followingsData?.getMemberFollowings.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const run = async (task: () => Promise<unknown>, done?: string) => {
		try {
			await task();
			if (done) await sweetTopSuccessAlert(done, 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};
	const block = async (id: string, name: string) => {
		const ok = await sweetConfirmAlert(
			`Block ${name}? They won't be able to comment on, like, follow or request test drives for your cars and articles. They are not notified.`,
			'Block',
			true,
		);
		if (ok) await run(() => blockMember({ variables: { input: id } }), 'Blocked');
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? 'Followers & following' : 'Following'}</h1>
					<p>{isAgent ? 'People who follow you see your new cars first.' : 'Dealers you follow, newest first.'}</p>
				</div>
			</div>
			{isAgent && (
				<div className="kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
					<div className="kpi">
						<small>Followers</small>
						<b>{followersTotal}</b>
					</div>
					<div className="kpi">
						<small>Following</small>
						<b>{followingsTotal}</b>
					</div>
				</div>
			)}
			<div className="block">
				<div className="block-head">
					<h2>{tab === 'followers' ? 'People who follow you' : 'Dealers you follow'}</h2>
				</div>
				{isAgent && (
					<div className="ftabs">
						{(['followers', 'followings'] as const).map((t) => (
							<span
								key={t}
								className={`chip ${tab === t ? 'on' : ''}`}
								onClick={() => {
									setTab(t);
									setPage(1);
								}}
							>
								{t === 'followers' ? 'Followers' : 'Following'} <span className="num">{t === 'followers' ? followersTotal : followingsTotal}</span>
							</span>
						))}
					</div>
				)}
				<table className="flist">
					<thead>
						<tr>
							<th>{tab === 'followers' ? 'Member' : 'Dealer'}</th>
							<th>Type</th>
							<th>Since</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{tab === 'followers'
							? followers.map((f) => {
									const p = f.followerData;
									const dealer = !!p?.agentCompany;
									const iFollow = !!f.meFollowed?.[0]?.myFollowing;
									return (
										<tr key={f._id}>
											<td>
												<div className="person">
													<div className={`avatar ${dealer ? '' : 'user'}`}>{initial(dealerName(p))}</div>
													<div>
														<b>{dealerName(p)}</b>
														{dealer && <small>{p?.memberNick}</small>}
													</div>
												</div>
											</td>
											<td>
												<span className={`rolepill ${dealer ? 'd' : 'b'}`}>{dealer ? 'Dealer' : 'Buyer'}</span>
											</td>
											<td>{timeAgo(f.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													{dealer &&
														(iFollow ? (
															<button className="btn ghost sm" onClick={() => run(() => unsubscribe({ variables: { input: f.followerId } }))}>
																Following
															</button>
														) : (
															<button className="btn dark sm" onClick={() => run(() => subscribe({ variables: { input: f.followerId } }))}>
																Follow back
															</button>
														))}
													<button className="btn danger sm" onClick={() => block(f.followerId, dealerName(p))}>
														Block
													</button>
												</div>
											</td>
										</tr>
									);
								})
							: followings.map((f) => {
									const p = f.followingData;
									return (
										<tr key={f._id}>
											<td>
												<div className="person">
													<div className="avatar">{initial(dealerName(p))}</div>
													<div>
														<b>{dealerName(p)}</b>
														<small>{p?.memberNick}</small>
													</div>
												</div>
											</td>
											<td>
												<span className="rolepill d">Dealer</span>
											</td>
											<td>{timeAgo(f.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													<Link href={`/agent/detail?id=${f.followingId}`} className="btn ghost sm">
														View dealer
													</Link>
													<button className="btn ghost sm" onClick={() => run(() => unsubscribe({ variables: { input: f.followingId } }), 'Unfollowed')}>
														Unfollow
													</button>
												</div>
											</td>
										</tr>
									);
								})}
					</tbody>
				</table>
				{(tab === 'followers' ? followers : followings).length === 0 && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>{tab === 'followers' ? 'No followers yet' : "You don't follow any dealers"}</h3>
						<p>{tab === 'followers' ? 'Buyers who follow you show up here.' : 'Follow a dealer from their page to see their new cars first.'}</p>
						{tab === 'followings' && (
							<Link href="/agent" className="btn ghost">
								Browse dealers
							</Link>
						)}
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil((tab === 'followers' ? followersTotal : followingsTotal) / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyFollows;
