import React, { useState } from 'react';
import { NotificationGroup, NotificationStatus, NotificationType } from '../../enums/notification.enum';
import { timeAgo } from '../../utils';

const minsAgo = (m: number) => new Date(Date.now() - m * 60000);

// sample rows from the UI design, shaped like the API's notifications
const notifications = [
	{ _id: 'n1', type: NotificationType.TEST_DRIVE, group: NotificationGroup.CAR, status: NotificationStatus.WAIT, title: 'sora.lee wants to test drive your Kia Sorento 2.2 Diesel', desc: 'Thu 1 Oct, 11:00', when: minsAgo(5) },
	{ _id: 'n2', type: NotificationType.LIKE, group: NotificationGroup.CAR, status: NotificationStatus.WAIT, title: 'dongwoo liked your Tesla Model 3', desc: '', when: minsAgo(60) },
	{ _id: 'n3', type: NotificationType.COMMENT, group: NotificationGroup.CAR, status: NotificationStatus.WAIT, title: 'hyejin_k commented on your Kia Sorento 2.2 Diesel', desc: '"Is the sunroof original or aftermarket?"', when: minsAgo(120) },
	{ _id: 'n4', type: NotificationType.AGENT_APPROVED, group: NotificationGroup.MEMBER, status: NotificationStatus.READ, title: 'Your dealer account was approved', desc: 'You can now list cars, write articles and answer test drives.', when: minsAgo(60 * 24) },
	{ _id: 'n5', type: NotificationType.TEST_DRIVE, group: NotificationGroup.CAR, status: NotificationStatus.READ, title: 'minji.p cancelled the test drive for your Kia Ray 1.0', desc: 'Was booked for Sat 26 Sep, 14:00', when: minsAgo(60 * 48) },
];

const icons: Partial<Record<NotificationType, { text: string; bg: string; color: string }>> = {
	[NotificationType.TEST_DRIVE]: { text: 'TD', bg: 'var(--road-tint)', color: 'var(--road)' },
	[NotificationType.LIKE]: { text: '♥', bg: '#FDECEA', color: '#D0392B' },
	[NotificationType.COMMENT]: { text: '💬', bg: 'var(--paper)', color: 'var(--asphalt)' },
	[NotificationType.FOLLOW]: { text: '+', bg: 'var(--paper)', color: 'var(--asphalt)' },
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

/** my notifications, newest first; unread ones are highlighted */
const MyNotifications = () => {
	const [group, setGroup] = useState<NotificationGroup | ''>('');
	const rows = notifications.filter((n) => !group || n.group === group);
	const unread = notifications.filter((n) => n.status === NotificationStatus.WAIT).length;

	return (
		<>
			<div className="main-head">
				<div>
					<h1>Notifications</h1>
					<p>{unread ? `${unread} unread` : 'All caught up'}</p>
				</div>
				<button className="btn ghost" disabled={!unread}>
					Mark all as read
				</button>
			</div>
			<div className="block">
				<div className="block-head">
					<div className="tabs2">
						{tabs.map((t) => (
							<span key={t.label} className={`chip ${group === t.group ? 'on' : ''}`} onClick={() => setGroup(t.group as NotificationGroup | '')}>
								{t.label}
							</span>
						))}
					</div>
				</div>
				{rows.map((n) => {
					const icon = icons[n.type] ?? { text: 'i', bg: 'var(--paper)', color: 'var(--asphalt)' };
					const isUnread = n.status === NotificationStatus.WAIT;
					return (
						<div key={n._id} className={`notif ${isUnread ? 'unread' : ''}`}>
							<div className="ico" style={{ background: icon.bg, color: icon.color, fontSize: icon.text.length > 1 ? 12 : 16 }}>
								{icon.text}
							</div>
							<div className="txt">
								{n.title}
								{n.desc && <small>{n.desc}</small>}
								{n.type === NotificationType.LISTING_CHECK && (
									<div className="rowacts" style={{ marginTop: 10 }}>
										<button className="btn good sm">Still for sale</button>
									</div>
								)}
							</div>
							<div className="when2">{timeAgo(n.when)}</div>
							{isUnread && <span className="dot" style={{ marginTop: 6 }} />}
						</div>
					);
				})}
				{!rows.length && (
					<div className="empty" style={{ margin: 18 }}>
						<h3>No notifications</h3>
						<p>Likes, comments and test drive updates show up here.</p>
					</div>
				)}
			</div>
		</>
	);
};

export default MyNotifications;
