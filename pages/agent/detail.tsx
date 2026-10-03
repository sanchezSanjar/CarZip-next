import React, { useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import Verified from '../../libs/components/common/Verified';
import CarCard from '../../libs/components/common/CarCard';
import ContactList from '../../libs/components/car/ContactList';
import { sampleAgents, sampleArticles, sampleCars, sampleDealers } from '../../libs/sampleData';
import { dealerName, initial } from '../../libs/utils';

const tabs = [
	{ key: 'cars', label: 'For sale' },
	{ key: 'articles', label: 'Articles' },
	{ key: 'comments', label: 'Comments' },
];

const AgentDetail: NextPage = () => {
	const router = useRouter();
	const agent = sampleAgents.find((a) => a._id === router.query.id) ?? sampleAgents[0];
	const contacts = sampleDealers.find((d) => d._id === agent._id);
	const [tab, setTab] = useState('cars');
	const cars = sampleCars.slice(0, 4).map((c) => ({ ...c, agentData: contacts }));

	return (
		<>
			<div className="agent-hero">
				<div className="top">
					<div className="logo-sq">{initial(dealerName(agent))}</div>
					<div>
						<h1>{dealerName(agent)}</h1>
						<div className="facts">
							<Verified />
							<span>{agent.memberAddress}</span>
							<span>
								<b className="num">{agent.memberCars}</b> for sale
							</span>
							<span>
								<b className="num">{agent.memberFollowers}</b> followers
							</span>
						</div>
					</div>
					<button className="btn dark">Follow</button>
				</div>
				<ContactList dealer={contacts} bar />
				<div className="tabs">
					{tabs.map((t) => (
						<span key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
							{t.label}
							<em>{t.key === 'cars' ? agent.memberCars : t.key === 'articles' ? agent.memberArticles : agent.memberComments}</em>
						</span>
					))}
				</div>
			</div>
			{tab === 'cars' && (
				<>
					<div className="offer">
						<div style={{ flex: 1 }}>
							<h3>Selling your own car?</h3>
							<p>{dealerName(agent)} can list and sell it for you. Contact them to agree the fee.</p>
						</div>
						{contacts?.contactPhone && (
							<a className="btn dark" href={`tel:${contacts.contactPhone}`}>
								Call the dealer
							</a>
						)}
					</div>
					<div className="grid4">
						{cars.map((car) => (
							<CarCard key={car._id} car={car} />
						))}
					</div>
				</>
			)}
			{tab === 'articles' && (
				<div className="wrap">
					<div className="card">
						{sampleArticles
							.filter((a) => a.memberId === agent._id)
							.map((a) => (
								<div key={a._id} className="post">
									<div>
										<h3>{a.articleTitle}</h3>
										<p>{a.articleContent}</p>
									</div>
									<div className="st">
										<b>{a.articleViews}</b> views
									</div>
								</div>
							))}
					</div>
				</div>
			)}
			{tab === 'comments' && (
				<div className="wrap">
					<div className="empty">
						<h3>No comments yet</h3>
						<p>Comments about this dealer show up here.</p>
					</div>
				</div>
			)}
		</>
	);
};

export default withLayoutBasic(AgentDetail, 'Dealer | CarZip');
