import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client/react';
import { GET_AGENTS } from '../../../apollo/user/query';
import { Member, Members } from '../../types/member/member';
import { AgentsInquiry } from '../../types/member/member.input';
import { Direction } from '../../enums/common.enum';
import { dealerName } from '../../utils';
import Verified from '../common/Verified';
import Avatar from '../common/Avatar';
import { useTranslation } from 'next-i18next/pages';

const PER_PAGE = 4;
const ROTATE_MS = 5000;

const initialInput: AgentsInquiry = { page: 1, limit: 12, sort: 'memberRank', direction: Direction.DESC };

const AgentTile = ({ agent, rank }: { agent: Member; rank: number }) => {
	const { t } = useTranslation('common');
	return (
		<Link href={`/agent/detail?id=${agent._id}`} className="agent-tile">
			<span className="rankno">#{rank}</span>
			<Avatar image={agent.memberImage} dealer className="agent-logo" />
			<b>{dealerName(agent)}</b>
			<span className="muted">{agent.memberAddress || 'Korea'}</span>
			<Verified />
			<div className="agent-nums">
				<div>
					<b className="num">{agent.memberCars}</b>
					{t('home.forSale')}
				</div>
				<div>
					<b className="num">{agent.memberFollowers}</b>
					{t('home.followers')}
				</div>
			</div>
		</Link>
	);
};

/** best-ranked dealers (memberRank, computed nightly by the batch), turning page by page on their own (paused while the mouse is over them) */
const TopAgents = () => {
	const { t } = useTranslation('common');
	const [page, setPage] = useState(0);
	const [paused, setPaused] = useState(false);

	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});
	const agents = data?.getAgents.list ?? [];
	const pages = Math.ceil(agents.length / PER_PAGE);

	/** LIFECYCLES **/
	useEffect(() => {
		if (paused || pages <= 1) return;
		const timer = setInterval(() => setPage((p) => (p + 1) % pages), ROTATE_MS);
		return () => clearInterval(timer);
	}, [paused, pages]);

	if (!agents.length) return null;
	const current = page % pages;

	return (
		<section className="home-section">
			<div className="home-head">
				<div>
					<h2>{t('home.topDealers')}</h2>
					<p>{t('home.topDealersText')}</p>
				</div>
				<Link href="/agent" className="btn ghost sm">
					{t('home.allDealers')}
				</Link>
			</div>
			<div className="agent-carousel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
				<div className="agent-track" style={{ transform: `translateX(-${current * 100}%)` }}>
					{Array.from({ length: pages }, (_, p) => (
						<div key={p} className="agent-page">
							{agents.slice(p * PER_PAGE, p * PER_PAGE + PER_PAGE).map((a, i) => (
								<AgentTile key={a._id} agent={a} rank={p * PER_PAGE + i + 1} />
							))}
						</div>
					))}
				</div>
			</div>
			{pages > 1 && (
				<div className="dots">
					{Array.from({ length: pages }, (_, p) => (
						<button
							key={p}
							className={p === current ? 'on' : ''}
							aria-label={`Page ${p + 1}`}
							onClick={() => setPage(p)}
						/>
					))}
				</div>
			)}
		</section>
	);
};

export default TopAgents;
