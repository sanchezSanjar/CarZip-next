import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT } from '../../../apollo/user/query';
import { MARK_NOTIFICATIONS_READ } from '../../../apollo/user/mutation';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { Notification, Notifications } from '../../types/notification/notification';
import { getErrorMessage } from '../../auth';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { timeAgo } from '../../utils';
import Pager from '../common/Pager';

const LIMIT = 15;

const icons: Partial<Record<NotificationType, { text: string; bg: string; color: string }>> = {
	[NotificationType.TEST_DRIVE]: { text: 'TD', bg: 'var(--road-tint)', color: 'var(--road)' },
	[NotificationType.LIKE]: { text: '♥', bg: '#FDECEA', color: '#D0392B' },
	[NotificationType.COMMENT]: { text: '💬', bg: 'var(--paper)', color: 'var(--asphalt)' },
	[NotificationType.FOLLOW]: { text: '+', bg: 'var(--paper)', color: 'var(--asphalt)' },
	[NotificationType.AGENT_APPLICATION]: { text: 'D', bg: 'var(--hold-tint)', color: 'var(--hold)' },
	[NotificationType.AGENT_APPROVED]: { text: '✓', bg: 'var(--dealer-tint)', color: 'var(--dealer)' },
	[NotificationType.AGENT_REJECTED]: { text: '!', bg: 'var(--stop-tint)', color: 'var(--stop)' },
	[NotificationType.CAR_MODERATED]: { text: '!', bg: 'var(--hold-tint)', color: 'var(--hold)' },
	[NotificationType.LISTING_CHECK]: { text: '?', bg: 'var(--hold-tint)', color: 'var(--hold)' },
};

const tabs = [
	{ group: '', label: 'All' },
	{ group: NotificationGroup.CAR, label: 'Cars' },
	{ group: NotificationGroup.ARTICLE, label: 'Articles' },
	{ group: NotificationGroup.MEMBER, label: 'Account' },
];

/** my notifications, newest first; opening one marks it read and goes to the car or article it is about */
const MyNotifications = () => {
	const router = useRouter();
	const [group, setGroup] = useState<NotificationGroup | ''>('');
	const [unreadOnly, setUnreadOnly] = useState(false);
	const [page, setPage] = useState(1);

	/** APOLLO REQUESTS **/
	const search = {
		...(group ? { notificationGroup: group } : {}),
		...(unreadOnly ? { notificationStatus: NotificationStatus.WAIT } : {}),
	};
	const { data, loading } = useQuery<{ getNotifications: Notifications }>(GET_NOTIFICATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page, limit: LIMIT, ...(Object.keys(search).length ? { search } : {}) } },
	});
	const { data: unreadData } = useQuery<{ getUnreadNotificationCount: number }>(GET_UNREAD_NOTIFICATION_COUNT, { fetchPolicy: 'cache-and-network' });
	const [markRead] = useMutation(MARK_NOTIFICATIONS_READ, { refetchQueries: [GET_NOTIFICATIONS, GET_UNREAD_NOTIFICATION_COUNT] });

	const rows = data?.getNotifications.list ?? [];
	const total = data?.getNotifications.metaCounter?.[0]?.total ?? 0;
	const unread = unreadData?.getUnreadNotificationCount ?? 0;

	/** HANDLERS **/
	const markAllRead = async () => {
		try {
			await markRead({ variables: { input: {} } }); // no ids = all
		} catch (err) {
			await sweetMixinErrorAlert(getErrorMessage(err));
		}
	};

	const open = async (n: Notification) => {
		if (n.notificationStatus === NotificationStatus.WAIT) await markRead({ variables: { input: { notificationIds: [n._id] } } }).catch(() => null);
		if (n.carId) await router.push(`/car/detail?id=${n.carId}`);
		else if (n.articleId) await router.push(`/community/detail?id=${n.articleId}`);
		else if (n.notificationType === NotificationType.TEST_DRIVE) await router.push('/mypage?category=testDrives');
	};

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Notifications</h1>
					<p>{unread ? `${unread} unread` : 'All caught up'}</p>
				</div>
				<button className="btn ghost" disabled={!unread} onClick={markAllRead}>
					Mark all as read
				</button>
			</div>
			<div className="block">
				<div className="block-head">
					<div className="tabs2">
						{tabs.map((t) => (
							<span
								key={t.label}
								className={`chip ${group === t.group ? 'on' : ''}`}
								onClick={() => {
									setGroup(t.group as NotificationGroup | '');
									setPage(1);
								}}
							>
								{t.label}
							</span>
						))}
					</div>
					<label style={{ fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer' }}>
						<input
							type="checkbox"
							checked={unreadOnly}
							onChange={(e) => {
								setUnreadOnly(e.target.checked);
								setPage(1);
							}}
						/>
						Unread only
					</label>
				</div>
				{rows.map((n) => {
					const icon = icons[n.notificationType] ?? { text: 'i', bg: 'var(--paper)', color: 'var(--asphalt)' };
					const isUnread = n.notificationStatus === NotificationStatus.WAIT;
					return (
						<div key={n._id} className={`notif ${isUnread ? 'unread' : ''}`} role="button" style={{ cursor: 'pointer' }} onClick={() => open(n)}>
							<div className="ico" style={{ background: icon.bg, color: icon.color, fontSize: icon.text.length > 1 ? 12 : 16 }}>
								{icon.text}
							</div>
							<div className="txt">
								<b>{n.notificationTitle}</b>
								{n.notificationDesc && <small>{n.notificationDesc}</small>}
							</div>
							<div className="when2">{timeAgo(n.createdAt)}</div>
							{isUnread && <span className="dot" style={{ marginTop: 6 }} />}
						</div>
					);
				})}
				{!loading && !rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No notifications</h3>
						<p>Likes, comments and test drive updates show up here.</p>
					</div>
				)}
			</div>
			<Pager page={page} total={Math.ceil(total / LIMIT)} onChange={setPage} />
		</>
	);
};

export default MyNotifications;
