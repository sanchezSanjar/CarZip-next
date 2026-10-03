import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_MY_BLOCKS } from '../../../apollo/user/query';
import { UNBLOCK_MEMBER } from '../../../apollo/user/mutation';
import { Blocks } from '../../types/block/block';
import { getErrorMessage } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { dealerName, initial, timeAgo } from '../../utils';
import Pager from '../common/Pager';

const LIMIT = 10;

/** dealer: people blocked from interacting with own cars, articles and profile. Nobody is notified */
const MyBlocks = () => {
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const { data, loading } = useQuery<{ getMyBlocks: Blocks }>(GET_MY_BLOCKS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT } },
	});
	const [unblockMember] = useMutation(UNBLOCK_MEMBER, { refetchQueries: [GET_MY_BLOCKS] });
	const blocks = data?.getMyBlocks.list ?? [];
	const total = data?.getMyBlocks.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const unblock = async (memberId: string) => {
		try {
			await unblockMember({ variables: { input: memberId } });
			await sweetTopSuccessAlert('Unblocked', 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Blocked people</h1>
					<p>People you blocked can still see your cars and contacts, but can&apos;t interact with them.</p>
				</div>
			</div>
			<div className="twocol" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
				<div className="block" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							Blocked<span>{total}</span>
						</h2>
					</div>
					{blocks.length ? (
						<table>
							<thead>
								<tr>
									<th>Person</th>
									<th>Blocked</th>
									<th />
								</tr>
							</thead>
							<tbody>
								{blocks.map((b) => {
									const dealer = !!b.blockedData?.agentCompany;
									return (
										<tr key={b._id}>
											<td>
												<div className="person">
													<div className={`avatar ${dealer ? '' : 'user'}`}>{initial(dealerName(b.blockedData))}</div>
													<div>
														<b>{dealerName(b.blockedData)}</b>
														<small>{dealer ? 'Dealer' : 'Buyer'}</small>
													</div>
												</div>
											</td>
											<td>{timeAgo(b.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													<button className="btn ghost sm" onClick={() => unblock(b.blockedId)}>
														Unblock
													</button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : (
						!loading && (
							<div className="empty" style={{ margin: 18 }}>
								<h3>You haven&apos;t blocked anyone</h3>
								<p>If someone is bothering you, block them from your followers or comments.</p>
							</div>
						)
					)}
				</div>
				<div className="sidecard">
					<h3>What blocking does</h3>
					<ul className="card-side" style={{ border: 0, padding: 0, margin: 0 }}>
						<li>They can&apos;t comment on your cars or articles</li>
						<li>They can&apos;t like your cars</li>
						<li>They can&apos;t follow you or request test drives from you</li>
						<li>They can still see your cars and contact details</li>
						<li className="x">It is not a CarZip-wide ban. Report serious abuse to admins.</li>
					</ul>
				</div>
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyBlocks;
