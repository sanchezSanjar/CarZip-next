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
import { dealerName, formatDateTime, initial, timeAgo } from '../../utils';
import CarPhoto from '../common/CarPhoto';
import Pager from '../common/Pager';

const LIMIT = 10;

const statusPill: Record<TestDriveStatus, { cls: string; label: string }> = {
	[TestDriveStatus.REQUEST]: { cls: 'req', label: 'Waiting' },
	[TestDriveStatus.CONFIRM]: { cls: 'active', label: 'Confirmed' },
	[TestDriveStatus.REJECT]: { cls: 'rej', label: 'Declined' },
	[TestDriveStatus.CANCEL]: { cls: 'sold', label: 'Cancelled' },
	[TestDriveStatus.COMPLETE]: { cls: 'sold', label: 'Done' },
};
const filters = [TestDriveStatus.REQUEST, TestDriveStatus.CONFIRM, TestDriveStatus.COMPLETE, TestDriveStatus.CANCEL, TestDriveStatus.REJECT];

/**
 * Dealer: requests from buyers: confirm or decline, mark done after the date, cancel a confirmed one.
 * Buyer: own requests: cancel. The buyer's phone shows to the dealer only after confirming.
 */
const TestDrives = () => {
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
		if (question && !(await sweetConfirmAlert(question, 'Yes', next !== TestDriveStatus.CONFIRM && next !== TestDriveStatus.COMPLETE))) return;
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
					<h1>{isAgent ? 'Test drives' : 'My test drives'}</h1>
					<p>
						{isAgent
							? waiting
								? `${waiting} test drive request${waiting > 1 ? 's are' : ' is'} waiting for your answer.`
								: 'No requests are waiting for your answer.'
							: 'The dealer confirms or declines your request. You get a notification either way.'}
					</p>
				</div>
				{!isAgent && (
					<Link href="/car?testDrive=1" className="btn primary">
						Find a car to test drive
					</Link>
				)}
			</div>
			<div className="block">
				<div className="block-head">
					<h2>
						{isAgent ? 'Requests' : 'Your requests'}
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
							All
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
								{statusPill[s].label}
							</span>
						))}
					</div>
				</div>
				<table>
					<thead>
						<tr>
							<th>{isAgent ? 'Buyer' : 'Dealer'}</th>
							<th>Car</th>
							<th>Date</th>
							<th>Message</th>
							<th>Status</th>
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
											<div className={`avatar ${isAgent ? 'user' : ''}`}>{initial(person)}</div>
											<div>
												<b>{person}</b>
												<small>
													{isAgent && r.buyerData?.memberPhone
														? r.buyerData.memberPhone
														: !isAgent && r.sellerData?.contactPhone
															? r.sellerData.contactPhone
															: `asked ${timeAgo(r.createdAt)}`}
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
										<b>{formatDateTime(r.testDriveDate)}</b>
										<small>{datePassed ? 'date passed' : `in ${Math.ceil((new Date(r.testDriveDate).getTime() - now) / 86400000)} days`}</small>
									</td>
									<td className="msg">{r.testDriveMessage || '—'}</td>
									<td>
										<span className={`pill ${statusPill[r.testDriveStatus].cls}`}>{statusPill[r.testDriveStatus].label}</span>
									</td>
									<td>
										<div className="rowacts" style={{ justifyContent: 'flex-end' }}>
											{isAgent && r.testDriveStatus === TestDriveStatus.REQUEST && (
												<>
													{!datePassed && (
														<button className="btn good sm" onClick={() => changeStatus(r._id, TestDriveStatus.CONFIRM)}>
															Confirm
														</button>
													)}
													<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.REJECT, 'Decline this request? The buyer can ask for another date.')}>
														Decline
													</button>
												</>
											)}
											{isAgent && r.testDriveStatus === TestDriveStatus.CONFIRM && datePassed && (
												<button className="btn good sm" onClick={() => changeStatus(r._id, TestDriveStatus.COMPLETE)}>
													Mark as done
												</button>
											)}
											{!isAgent && r.testDriveStatus === TestDriveStatus.REQUEST && (
												<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.CANCEL, 'Cancel your test drive request?')}>
													Cancel
												</button>
											)}
											{r.testDriveStatus === TestDriveStatus.CONFIRM && (
												<button className="btn danger sm" onClick={() => changeStatus(r._id, TestDriveStatus.CANCEL, 'Cancel this confirmed test drive? The other side is notified.')}>
													Cancel
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
						<h3>No test drives here</h3>
						<p>
							{isAgent
								? 'Requests from buyers show up here. Cars with test drives turned on get more of them.'
								: 'Open a car that offers test drives and pick a date to send a request.'}
						</p>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default TestDrives;
