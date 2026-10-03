import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_MY_BLOCKS } from '../../../apollo/user/query';
import { UNBLOCK_MEMBER } from '../../../apollo/user/mutation';
import { Blocks } from '../../types/block/block';
import { getErrorMessage } from '../../auth';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../sweetAlert';
import { dealerName } from '../../utils';
import Pager from '../common/Pager';
import Avatar from '../common/Avatar';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const LIMIT = 10;

/** dealer: people blocked from interacting with own cars, articles and profile. Nobody is notified */
const MyBlocks = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
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
			await sweetTopSuccessAlert(t('blk.unblocked'), 1000);
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{t('menu.blocked')}</h1>
					<p>{t('blk.sub')}</p>
				</div>
			</div>
			<div className="twocol" style={{ gridTemplateColumns: '1fr 360px', alignItems: 'start' }}>
				<div className="block" style={{ margin: 0 }}>
					<div className="block-head">
						<h2>
							{t('blk.blocked')}
							<span>{total}</span>
						</h2>
					</div>
					{blocks.length ? (
						<table>
							<thead>
								<tr>
									<th>{t('blk.person')}</th>
									<th>{t('blk.blocked')}</th>
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
													<Avatar image={b.blockedData?.memberImage} dealer={dealer} />
													<div>
														<b>{dealerName(b.blockedData)}</b>
														<small>{dealer ? t('board.dealer') : t('menu.buyer')}</small>
													</div>
												</div>
											</td>
											<td>{fmt.timeAgo(b.createdAt)}</td>
											<td>
												<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
													<button className="btn ghost sm" onClick={() => unblock(b.blockedId)}>
														{t('dealers.unblock')}
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
								<h3>{t('blk.none')}</h3>
								<p>{t('blk.noneText')}</p>
							</div>
						)
					)}
				</div>
				<div className="sidecard">
					<h3>{t('blk.whatTitle')}</h3>
					<ul className="card-side" style={{ border: 0, padding: 0, margin: 0 }}>
						<li>{t('blk.w1')}</li>
						<li>{t('blk.w2')}</li>
						<li>{t('blk.w3')}</li>
						<li>{t('blk.w4')}</li>
						<li className="x">{t('blk.w5')}</li>
					</ul>
				</div>
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyBlocks;
