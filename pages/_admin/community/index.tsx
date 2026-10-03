import React, { useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import withLayoutAdmin from '../../../libs/components/layout/LayoutAdmin';
import { sampleArticles } from '../../../libs/sampleData';
import { dealerName, enumLabel, formatNumber, initial, timeAgo } from '../../../libs/utils';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000);

// sample comments from the UI design
const comments = [
	{ _id: 'm3', nick: 'car_hunter88', text: "Same car is 400만원 cheaper at another lot. Don't buy here.", on: 'Tesla Model 3 (Mokdong Motors)', when: hoursAgo(3) },
	{ _id: 'm5', nick: 'spam_seller01', text: 'Cheap cars!!! Kakao me: xxcars77 for 50% off all brands', on: 'Genesis GV70 2.5T (Gangnam Premium)', when: hoursAgo(24) },
	{ _id: 'm1', nick: 'hyejin_k', text: 'Is the sunroof original or aftermarket?', on: 'Kia Sorento 2.2 Diesel (Mokdong Motors)', when: hoursAgo(48) },
];

/** admin: only admins delete comments; articles can be hidden (DELETE), restored, or removed for good */
const AdminCommunity: NextPage = () => {
	const [tab, setTab] = useState<'comments' | 'articles'>('comments');

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Comments & articles</h1>
					<p>Only admins can delete comments.</p>
				</div>
			</div>
			<div className="bar" style={{ marginTop: 0 }}>
				<div className="tabs2">
					<span className={`chip ${tab === 'comments' ? 'on' : ''}`} onClick={() => setTab('comments')}>
						Comments
					</span>
					<span className={`chip ${tab === 'articles' ? 'on' : ''}`} onClick={() => setTab('articles')}>
						Articles <span className="num">{sampleArticles.length}</span>
					</span>
				</div>
				<div className="grow" />
				<input className="field" style={{ width: 280 }} placeholder="Search text or author" />
			</div>

			{tab === 'comments' && (
				<div className="block">
					<table>
						<thead>
							<tr>
								<th>Author</th>
								<th>Comment</th>
								<th>On</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{comments.map((c) => (
								<tr key={c._id} className="cm-row">
									<td>
										<div className="person">
											<div className="avatar user">{initial(c.nick)}</div>
											<div>
												<b>{c.nick}</b>
												<small>Buyer</small>
											</div>
										</div>
									</td>
									<td>
										<div className="quote">
											{c.text}
											<small>{timeAgo(c.when)}</small>
										</div>
									</td>
									<td style={{ fontSize: 13.5 }}>{c.on}</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											<button className="btn danger sm">Delete comment</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{tab === 'articles' && (
				<div className="block">
					<table>
						<thead>
							<tr>
								<th>Article</th>
								<th>Author</th>
								<th>Category</th>
								<th>Views</th>
								<th>Status</th>
								<th />
							</tr>
						</thead>
						<tbody>
							{sampleArticles.map((a) => (
								<tr key={a._id}>
									<td style={{ fontWeight: 600 }}>
										<Link href={`/community/detail?id=${a._id}`} style={{ color: 'inherit' }}>
											{a.articleTitle}
										</Link>
									</td>
									<td>{dealerName(a.memberData)}</td>
									<td>
										<span className="cat">{enumLabel(a.articleCategory)}</span>
									</td>
									<td className="num">{formatNumber(a.articleViews)}</td>
									<td>
										<span className="pill active">Active</span>
									</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											<button className="btn danger sm">Delete</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</>
	);
};

export default withLayoutAdmin(AdminCommunity);
