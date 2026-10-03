import React from 'react';
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
import Carousel from '../common/Carousel';
import useDeviceDetect from '../../hooks/useDeviceDetect';

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

/** best-ranked dealers (memberRank, computed nightly by the batch): a slider with arrows that also turns on its own */
const TopAgents = () => {
	const { t } = useTranslation('common');
	const perSlide = useDeviceDetect() === 'mobile' ? 2 : 4;

	/** APOLLO REQUESTS **/
	const { data } = useQuery<{ getAgents: Members }>(GET_AGENTS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
	});
	const agents = data?.getAgents.list ?? [];
	if (!agents.length) return null;

	const slides = Array.from({ length: Math.ceil(agents.length / perSlide) }, (_, p) => (
		<div key={p} className="agent-page">
			{agents.slice(p * perSlide, p * perSlide + perSlide).map((a, i) => (
				<AgentTile key={a._id} agent={a} rank={p * perSlide + i + 1} />
			))}
		</div>
	));

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
			<Carousel slides={slides} autoMs={ROTATE_MS} />
		</section>
	);
};

export default TopAgents;
