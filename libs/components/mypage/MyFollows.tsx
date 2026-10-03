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
import { dealerName } from '../../utils';
import Pager from '../common/Pager';
import Avatar from '../common/Avatar';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const LIMIT = 10;

/**
 * Only dealers can be followed, so buyers only have "Following".
 * Dealers also see who follows them, can follow dealers back and can block people.
 */
const MyFollows = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
			t('dealers.blockQ', { name }),
			t('dealers.block'),
			true,
		);
		if (ok) await run(() => blockMember({ variables: { input: id } }), t('my.blocked'));
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? t('menu.follows') : t('menu.following')}</h1>
					<p>{isAgent ? t('fl.agentSub') : t('fl.buyerSub')}</p>
				</div>
			</div>
			{isAgent && (
				<div className="kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
					<div className="kpi">
						<small>{t('fl.followers')}</small>
						<b>{followersTotal}</b>
					</div>
					<div className="kpi">
						<small>{t('menu.following')}</small>
						<b>{followingsTotal}</b>
					</div>
				</div>
			)}
			<div className="block">
				<div className="block-head">
					<h2>{tab === 'followers' ? t('fl.whoFollow') : t('fl.youFollow')}</h2>
				</div>
				{isAgent && (
					<div className="ftabs">
						{(['followers', 'followings'] as const).map((which) => (
							<span
								key={which}
								className={`chip ${tab === which ? 'on' : ''}`}
								onClick={() => {
									setTab(which);
									setPage(1);
								}}
							>
								{which === 'followers' ? t('fl.followers') : t('menu.following')}{' '}
								<span className="num">{which === 'followers' ? followersTotal : followingsTotal}</span>
							</span>
						))}
					</div>
				)}
				<table className="flist">
					<thead>
						<tr>
							<th>{tab === 'followers' ? t('fl.member') : t('board.dealer')}</th>
							<th>{t('fl.type')}</th>
							<th>{t('fl.since')}</th>
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
													<Avatar image={p?.memberImage} dealer={dealer} />
													<div>
														<b>{dealerName(p)}</b>
														{dealer && <small>{p?.memberNick}</small>}
													</div>
												</div>
											</td>
											<td>
												<span className={`rolepill ${dealer ? 'd' : 'b'}`}>{dealer ? t('board.dealer') : t('menu.buyer')}</span>
											</td>
											<td>{fmt.timeAgo(f.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													{dealer &&
														(iFollow ? (
															<button className="btn ghost sm" onClick={() => run(() => unsubscribe({ variables: { input: f.followerId } }))}>
																{t('follow.following')}
															</button>
														) : (
															<button className="btn dark sm" onClick={() => run(() => subscribe({ variables: { input: f.followerId } }))}>
																{t('fl.followBack')}
															</button>
														))}
													<button className="btn danger sm" onClick={() => block(f.followerId, dealerName(p))}>
														{t('dealers.block')}
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
													<Avatar image={p?.memberImage} dealer />
													<div>
														<b>{dealerName(p)}</b>
														<small>{p?.memberNick}</small>
													</div>
												</div>
											</td>
											<td>
												<span className="rolepill d">{t('board.dealer')}</span>
											</td>
											<td>{fmt.timeAgo(f.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													<Link href={`/agent/detail?id=${f.followingId}`} className="btn ghost sm">
														{t('dealers.viewDealer')}
													</Link>
													<button className="btn ghost sm" onClick={() => run(() => unsubscribe({ variables: { input: f.followingId } }), t('fl.unfollowed'))}>
														{t('fl.unfollow')}
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
						<h3>{tab === 'followers' ? t('fl.noFollowers') : t('fl.noFollowing')}</h3>
						<p>{tab === 'followers' ? t('fl.noFollowersText') : t('fl.noFollowingText')}</p>
						{tab === 'followings' && (
							<Link href="/agent" className="btn ghost">
								{t('fl.browseDealers')}
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
