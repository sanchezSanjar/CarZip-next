import React from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client/react';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Verified from '../../libs/components/common/Verified';
import Pager from '../../libs/components/common/Pager';
import FollowButton from '../../libs/components/common/FollowButton';
import { GET_AGENTS } from '../../apollo/user/query';
import { Members } from '../../libs/types/member/member';
import { Direction } from '../../libs/enums/common.enum';
import { dealerName } from '../../libs/utils';
import Avatar from '../../libs/components/common/Avatar';

const LIMIT = 9;
// the sorts the API accepts for dealers
const agentSorts = [
	{ label: 'Top ranked', sort: 'memberRank' },
	{ label: 'Most cars for sale', sort: 'memberCars' },
	{ label: 'Most liked', sort: 'memberLikes' },
	{ label: 'Most viewed', sort: 'memberViews' },
	{ label: 'Newest', sort: 'createdAt' },
];

/** /agent?text=jeju&sort=memberCars&page=2 : the search lives in the address, so reloading or sharing keeps it */
const AgentList: NextPage = () => {
	const router = useRouter();
	const one = (key: string) => (typeof router.query[key] === 'string' ? (router.query[key] as string) : '');
	const search = one('text').trim().slice(0, 50);
	const sort = agentSorts.some((s) => s.sort === one('sort')) ? one('sort') : 'memberRank';
	const page = Math.max(1, Number(one('page')) || 1);

	// writes the new search to the address; defaults are left out to keep links short
	const update = (next: { text?: string; sort?: string; page?: number }) => {
		const merged = { text: search, sort, page, ...next };
		const query: Record<string, string> = {};
		if (merged.text) query.text = merged.text;
		if (merged.sort !== 'memberRank') query.sort = merged.sort;
		if (merged.page > 1) query.page = String(merged.page);
		router.push({ pathname: '/agent', query }, undefined, { shallow: true, scroll: false }).then();
	};
	const setPage = (p: number) => update({ page: p });

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: { page, limit: LIMIT, sort, direction: Direction.DESC, ...(search ? { search: { text: search } } : {}) },
		},
	});
	const agents = data?.getAgents.list ?? [];
	const total = data?.getAgents.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const searchHandler = (e: React.FormEvent) => {
		e.preventDefault();
		const typed = new FormData(e.currentTarget as HTMLFormElement).get('text');
		update({ text: String(typed ?? '').trim(), page: 1 });
	};

	return (
		<div className="wrap">
			<h1 className="page-title">Dealers</h1>
			<p className="page-sub">
				Every dealer is checked by CarZip before they can list cars. Call or message them directly.
			</p>
			<form className="bar" onSubmit={searchHandler}>
				{/* re-drawn whenever the address changes, so a shared link fills the box */}
				<input key={search} name="text" className="field grow" placeholder="Search by nickname" defaultValue={search} />
				<button className="btn dark">Search</button>
				<select
					className="field"
					style={{ width: 220, fontWeight: 600 }}
					value={sort}
					onChange={(e) => update({ sort: e.target.value, page: 1 })}
				>
					{agentSorts.map((s) => (
						<option key={s.sort} value={s.sort}>
							{s.label}
						</option>
					))}
				</select>
			</form>
			{search && (
				<p className="muted" style={{ marginBottom: 14 }}>
					{total} dealer{total === 1 ? '' : 's'} matching “{search}” ·{' '}
					<a style={{ cursor: 'pointer' }} onClick={() => update({ text: '', page: 1 })}>
						Show all
					</a>
				</p>
			)}
			<div className="dgrid" style={{ opacity: loading && agents.length ? 0.6 : 1 }}>
				{agents.map((agent, i) => (
					<div key={agent._id} className="dcard">
						<div className="top">
							<Avatar image={agent.memberImage} dealer className="sq" />
							<div>
								<h3>{dealerName(agent)}</h3>
								<div className="muted" style={{ fontSize: 13 }}>
									{agent.memberAddress || 'Korea'}
								</div>
								<Verified />
							</div>
							{sort === 'memberRank' && !search && <span className="rankno">#{(page - 1) * LIMIT + i + 1}</span>}
						</div>
						{agent.memberDesc && (
							<p
								className="muted"
								style={{
									fontSize: 13.5,
									marginTop: 12,
									display: '-webkit-box',
									WebkitLineClamp: 2,
									WebkitBoxOrient: 'vertical',
									overflow: 'hidden',
								}}
							>
								{agent.memberDesc}
							</p>
						)}
						<div className="nums">
							<div>
								<b>{agent.memberCars}</b>for sale
							</div>
							<div>
								<b>{agent.memberFollowers}</b>followers
							</div>
							<div>
								<b>{agent.memberArticles}</b>articles
							</div>
						</div>
						<div className="acts2">
							<Link href={`/agent/detail?id=${agent._id}`} className="btn ghost sm">
								View dealer
							</Link>
							<FollowButton dealerId={agent._id} className="btn dark sm" />
						</div>
					</div>
				))}
			</div>
			{!loading && !agents.length && (
				<div className="empty">
					<h3>No dealers found</h3>
					<p>Try another nickname.</p>
				</div>
			)}
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</div>
	);
};

export default withLayoutBasic(AgentList, 'Dealers | CarZip');
