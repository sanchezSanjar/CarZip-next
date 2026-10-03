import React, { useState } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { MemberType } from '../../enums/member.enum';
import { initial, timeAgo } from '../../utils';

const ago = (d: number) => new Date(Date.now() - d * 86400000);

// sample rows from the UI design
const followers = [
	{ _id: 'u1', nick: 'hyejin_k', dealer: false, city: 'Busan', since: ago(3), iFollow: false },
	{ _id: 'd2', nick: 'Gangnam Premium', dealer: true, city: 'Seoul', since: ago(7), iFollow: false },
	{ _id: 'u2', nick: 'dongwoo', dealer: false, city: 'Seoul', since: ago(14), iFollow: false },
	{ _id: 'u3', nick: 'sora.lee', dealer: false, city: 'Incheon', since: ago(21), iFollow: false },
	{ _id: 'd3', nick: 'Haeundae Cars', dealer: true, city: 'Busan', since: ago(30), iFollow: true },
];
const followings = [
	{ _id: 'd2', nick: 'Gangnam Premium', city: 'Seoul', cars: 57 },
	{ _id: 'd5', nick: 'Yuseong Auto', city: 'Daejon', cars: 19 },
	{ _id: 'd3', nick: 'Haeundae Cars', city: 'Busan', cars: 33 },
	{ _id: 'd6', nick: 'Jeju Island Rent', city: 'Jeju', cars: 24 },
];

/**
 * Only dealers can be followed, so buyers only have "Following".
 * Dealers also see who follows them and can block people.
 */
const MyFollows = () => {
	const user = useReactiveVar(userVar);
	const isAgent = user.memberType === MemberType.AGENT;
	const [tab, setTab] = useState<'followers' | 'followings'>(isAgent ? 'followers' : 'followings');
	const [text, setText] = useState('');
	const match = (nick: string) => nick.toLowerCase().includes(text.toLowerCase());

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? 'Followers & following' : 'Following'}</h1>
					<p>
						{isAgent
							? 'Followers get a notification when you list a new car.'
							: 'You get notified when dealers you follow list a new car.'}
					</p>
				</div>
				<input className="field search-in" placeholder="Search by nickname" value={text} onChange={(e) => setText(e.target.value)} />
			</div>
			{isAgent && (
				<div className="kpis" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
					<div className="kpi">
						<small>Followers</small>
						<b>{followers.length}</b>
					</div>
					<div className="kpi">
						<small>Following</small>
						<b>{followings.length}</b>
					</div>
				</div>
			)}
			<div className="block">
				<div className="block-head">
					<h2>{tab === 'followers' ? 'People who follow you' : 'Dealers you follow'}</h2>
				</div>
				{isAgent && (
					<div className="ftabs">
						<span className={`chip ${tab === 'followers' ? 'on' : ''}`} onClick={() => setTab('followers')}>
							Followers <span className="num">{followers.length}</span>
						</span>
						<span className={`chip ${tab === 'followings' ? 'on' : ''}`} onClick={() => setTab('followings')}>
							Following <span className="num">{followings.length}</span>
						</span>
					</div>
				)}
				<table className="flist">
					<thead>
						<tr>
							<th>{tab === 'followers' ? 'Member' : 'Dealer'}</th>
							<th>Type</th>
							<th>{tab === 'followers' ? 'Followed' : 'Cars'}</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{tab === 'followers'
							? followers
									.filter((f) => match(f.nick))
									.map((f) => (
										<tr key={f._id}>
											<td>
												<div className="person">
													<div className={`avatar ${f.dealer ? '' : 'user'}`}>{initial(f.nick)}</div>
													<div>
														<b>{f.nick}</b>
														<small>{f.city}</small>
													</div>
												</div>
											</td>
											<td>
												<span className={`rolepill ${f.dealer ? 'd' : 'b'}`}>{f.dealer ? 'Dealer' : 'Buyer'}</span>
											</td>
											<td>{timeAgo(f.since)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													{f.dealer ? (
														f.iFollow ? (
															<button className="btn ghost sm">Following</button>
														) : (
															<button className="btn dark sm">Follow back</button>
														)
													) : null}
													<button className="btn danger sm">Block</button>
												</div>
											</td>
										</tr>
									))
							: followings
									.filter((f) => match(f.nick))
									.map((f) => (
										<tr key={f._id}>
											<td>
												<div className="person">
													<div className="avatar">{initial(f.nick)}</div>
													<div>
														<b>{f.nick}</b>
														<small>{f.city}</small>
													</div>
												</div>
											</td>
											<td>
												<span className="rolepill d">Dealer</span>
											</td>
											<td>{f.cars} cars for sale</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													<Link href={`/agent/detail?id=${f._id}`} className="btn ghost sm">
														View dealer
													</Link>
													<button className="btn ghost sm">Unfollow</button>
												</div>
											</td>
										</tr>
									))}
					</tbody>
				</table>
			</div>
		</>
	);
};

export default MyFollows;
