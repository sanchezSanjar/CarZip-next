import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client/react';
import { userVar } from '../../../apollo/store';
import { GET_AGENT_TEST_DRIVES, GET_MY_TEST_DRIVES } from '../../../apollo/user/query';
import { UPDATE_TEST_DRIVE } from '../../../apollo/user/mutation';
import { MemberType } from '../../enums/member.enum';
import { TestDriveStatus } from '../../enums/test-drive.enum';
import { TestDrives as TestDrivesPage } from '../../types/test-drive/test-drive';
import { getErrorMessage } from '../../auth';
import { sweetConfirmAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import { dealerName } from '../../utils';
import CarPhoto from '../common/CarPhoto';
import Pager from '../common/Pager';
import Avatar from '../common/Avatar';
import { useTranslation } from 'next-i18next/pages';
import { useLocaleFormat } from '../../hooks/useLocaleFormat';

const LIMIT = 10;

const statusPill: Record<TestDriveStatus, { cls: string; label: string }> = {
	[TestDriveStatus.REQUEST]: { cls: 'req', label: 'tds.waiting' },
	[TestDriveStatus.CONFIRM]: { cls: 'active', label: 'tds.confirmed' },
	[TestDriveStatus.REJECT]: { cls: 'rej', label: 'tds.declined' },
	[TestDriveStatus.CANCEL]: { cls: 'sold', label: 'tds.cancelled' },
	[TestDriveStatus.COMPLETE]: { cls: 'sold', label: 'tds.done' },
};
const filters = [TestDriveStatus.REQUEST, TestDriveStatus.CONFIRM, TestDriveStatus.COMPLETE, TestDriveStatus.CANCEL, TestDriveStatus.REJECT];

/**
 * Dealer: requests from buyers: confirm or decline, mark done after the date, cancel a confirmed one.
 * Buyer: own requests: cancel. The buyer's phone shows to the dealer only after confirming.
 */
const TestDrives = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const user = useReactiveVar(userVar);
	const isAgent = user.memberType === MemberType.AGENT;
	const [filter, setFilter] = useState<TestDriveStatus | ''>('');
	const [page, setPage] = useState(1);
	const [now] = useState(() => Date.now()); // read the clock once, not on every redraw

	/** APOLLO REQUESTS **/
	const QUERY = isAgent ? GET_AGENT_TEST_DRIVES : GET_MY_TEST_DRIVES;
	const input = { page, limit: LIMIT, sort: 'testDriveDate', ...(filter ? { search: { testDriveStatus: filter } } : {}) };
	const { data, loading } = useQuery<{ getAgentTestDrives?: TestDrivesPage; getMyTestDrives?: TestDrivesPage }>(QUERY, {
		fetchPolicy: 'cache-and-network',
		variables: { input },
		skip: !user._id,
	});
	const { data: waitingData } = useQuery<{ getAgentTestDrives?: TestDrivesPage }>(GET_AGENT_TEST_DRIVES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 1, search: { testDriveStatus: TestDriveStatus.REQUEST } } },
		skip: !isAgent,
	});
	const [updateTestDrive] = useMutation(UPDATE_TEST_DRIVE, { refetchQueries: [QUERY] });

	const result = isAgent ? data?.getAgentTestDrives : data?.getMyTestDrives;
	const rows = result?.list ?? [];
	const total = result?.metaCounter?.[0]?.total ?? 0;
	const waiting = waitingData?.getAgentTestDrives?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/
	const changeStatus = async (id: string, next: TestDriveStatus, question?: string) => {
		if (question && !(await sweetConfirmAlert(question, t('my.yes'), next !== TestDriveStatus.CONFIRM && next !== TestDriveStatus.COMPLETE))) return;
		try {
			await updateTestDrive({ variables: { input: { _id: id, testDriveStatus: next } } });
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>{isAgent ? t('menu.testDrives') : t('menu.myTestDrives')}</h1>
					<p>
						{isAgent
							? waiting
								? t('tds.waitingCount', { count: waiting })
								: t('tds.noneWaiting')
							: t('tds.buyerSub')}
					</p>
				</div>
				{!isAgent && (
					<Link href="/car?testDrive=1" className="btn primary">
						{t('tds.find')}
					</Link>
				)}
			</div>
			<div className="block">
				<div className="block-head">
					<h2>
						{isAgent ? t('tds.requests') : t('tds.yourRequests')}
						<span>{total}</span>
					</h2>
					<div className="chips">
						<span
							className={`chip ${filter === '' ? 'on' : ''}`}
							onClick={() => {
								setFilter('');
								setPage(1);
							}}
						>
							{t('board.all')}
						</span>
						{filters.map((s) => (
							<span
								key={s}
								className={`chip ${filter === s ? 'on' : ''}`}
								onClick={() => {
									setFilter(s);
									setPage(1);
								}}
							>
								{t(statusPill[s].label)}
							</span>
						))}
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>{isAgent ? t('menu.buyer') : t('board.dealer')}</th>
							<th>{t('my.car')}</th>
							<th>{t('tds.date')}</th>
							<th>{t('tds.message')}</th>
							<th>{t('my.status')}</th>
							<th />
						</tr>
					</thead>
					<tbody>
						{rows.map((r) => {
							const person = isAgent ? r.buyerData?.memberNick ?? '' : dealerName(r.sellerData);
							const datePassed = new Date(r.testDriveDate).getTime() < now;
							return (
								<tr key={r._id}>
									<td>
										<div className="person">
											<Avatar image={isAgent ? r.buyerData?.memberImage : r.sellerData?.memberImage} dealer={!isAgent} />
											<div>
												<b>{person}</b>
												<small>
													{isAgent && r.buyerData?.memberPhone
														? r.buyerData.memberPhone
														: !isAgent && r.sellerData?.contactPhone
															? r.sellerData.contactPhone
															: t('tds.asked', { time: fmt.timeAgo(r.createdAt) })}
												</small>
											</div>
										</div>
									</td>
									<td>
										<div className="carcell">
											<CarPhoto image={r.carData?.carImages[0]} className="thumb" />
											<div>
												<Link href={`/car/detail?id=${r.carId}`} style={{ color: 'inherit' }}>
													<b>{r.carData?.carTitle}</b>
												</Link>
												<small>{r.carData?.carYear}</small>
											</div>
										</div>
									</td>
									<td className="when">
										<b>{fmt.dateTime(r.testDriveDate)}</b>
										<small>{datePassed ? t('tds.datePassed') : t('tds.inDays', { count: Math.ceil((new Date(r.testDriveDate).getTime() - now) / 86400000) })}</small>
									</td>
									<td className="msg">{r.testDriveMessage || '—'}</td>
									<td>
										<span className={`pill ${statusPill[r.testDriveStatus].cls}`}>{t(statusPill[r.testDriveStatus].label)}</span>
									</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											{isAgent && r.testDriveStatus === TestDriveStatus.REQUEST && (
												<>
													{!datePassed && (
														<button className="btn good sm" onClick={() => changeStatus(r._id, TestDriveStatus.CONFIRM)}>
															{t('tds.confirm')}
														</button>
													)}
													<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.REJECT, t('tds.declineQ'))}>
														{t('tds.decline')}
													</button>
												</>
											)}
											{isAgent && r.testDriveStatus === TestDriveStatus.CONFIRM && datePassed && (
												<button className="btn good sm" onClick={() => changeStatus(r._id, TestDriveStatus.COMPLETE)}>
													{t('tds.markDone')}
												</button>
											)}
											{!isAgent && r.testDriveStatus === TestDriveStatus.REQUEST && (
												<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.CANCEL, t('tds.cancelQ'))}>
													{t('my.cancel')}
												</button>
											)}
											{r.testDriveStatus === TestDriveStatus.CONFIRM && (
												<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.CANCEL, t('tds.cancelConfirmedQ'))}>
													{t('my.cancel')}
												</button>
											)}
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				{!loading && !rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>{t('tds.none')}</h3>
						<p>
							{isAgent
								? t('tds.noneAgent')
								: t('tds.noneBuyer')}
						</p>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default TestDrives;
