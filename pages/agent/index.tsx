import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Verified from '../../libs/components/common/Verified';
import CarPhoto from '../../libs/components/common/CarPhoto';
import Pager from '../../libs/components/common/Pager';
import { sampleAgents, sampleCars } from '../../libs/sampleData';
import { CarLocation } from '../../libs/enums/car.enum';
import { dealerName, enumLabel, initial } from '../../libs/utils';

const agentSorts = [
	{ label: 'Most followers', sort: 'memberFollowers' },
	{ label: 'Most cars for sale', sort: 'memberCars' },
	{ label: 'Most liked', sort: 'memberLikes' },
	{ label: 'Newest', sort: 'createdAt' },
];

const AgentList: NextPage = () => {
	const [text, setText] = useState('');
	const [page, setPage] = useState(1);
	const agents = sampleAgents;

	return (
		<div className="wrap">
			<h1 className="page-title">Dealers</h1>
			<p className="page-sub">Every dealer is checked by CarZip before they can list cars. Call or message them directly.</p>
			<div className="bar">
				<input className="field grow" placeholder="Search dealer or company name" value={text} onChange={(e) => setText(e.target.value)} />
				<select className="field" style={{ width: 200 }}>
					<option value="">All of Korea</option>
					{Object.values(CarLocation).map((l) => (
						<option key={l} value={l}>
							{enumLabel(l)}
						</option>
					))}
				</select>
				<select className="field" style={{ width: 220, fontWeight: 600 }}>
					{agentSorts.map((s) => (
						<option key={s.sort} value={s.sort}>
							{s.label}
						</option>
					))}
				</select>
			</div>
			<div className="dgrid">
				{agents.map((agent, i) => {
					const cars = sampleCars.filter((c) => c.memberId === agent._id).concat(sampleCars).slice(0, 3);
					return (
						<div key={agent._id} className="dcard">
							<div className="top">
								<div className="sq">{initial(dealerName(agent))}</div>
								<div>
									<h3>{dealerName(agent)}</h3>
									<div className="muted" style={{ fontSize: 13 }}>
										{agent.memberAddress}
									</div>
									<Verified />
								</div>
								<span className="rankno">#{i + 1}</span>
							</div>
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
							<div className="strip">
								{cars.map((c) => (
									<CarPhoto key={c._id} image={c.carImages[0]} type={c.carType} color={c.carColor} />
								))}
							</div>
							<div className="acts2">
								<Link href={`/agent/detail?id=${agent._id}`} className="btn ghost sm">
									View dealer
								</Link>
								<button className="btn dark sm">Follow</button>
							</div>
						</div>
					);
				})}
			</div>
			<Pager page={page} total={3} onChange={setPage} />
		</div>
	);
};

export default withLayoutBasic(AgentList, 'Dealers | CarZip');
