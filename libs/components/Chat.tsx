import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client/react';
import { useTranslation } from 'next-i18next/pages';
import { chatVar, userVar } from '../../apollo/store';
import { sendChat } from '../../apollo/socket';
import { MemberType } from '../enums/member.enum';
import { translateServerMessage } from '../serverMessages';
import { useLocaleFormat } from '../hooks/useLocaleFormat';
import Avatar from './common/Avatar';

const MAX_LENGTH = 500;

const BubbleIcon = () => (
	<svg viewBox="0 0 24 24" aria-hidden>
		<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.2 3.6c-.6.5-1.3.1-1.3-.6V16A2.5 2.5 0 0 1 4 13.5z" />
	</svg>
);

/**
 * The live chat: a round button in the corner that opens one public chat room (API.md §16).
 * Everyone can read; only logged-in members can send. Unread messages are counted while the window is closed.
 */
const Chat = () => {
	const { t } = useTranslation('common');
	const fmt = useLocaleFormat();
	const user = useReactiveVar(userVar);
	const chat = useReactiveVar(chatVar);
	const [open, setOpen] = useState(false);
	const [text, setText] = useState('');
	const [seen, setSeen] = useState(0); // how many messages were on screen when the window was last open
	const listRef = useRef<HTMLDivElement>(null);

	const unread = open ? 0 : Math.max(0, chat.messages.length - seen);
	const canSend = !!user._id && chat.status === 'open';

	/** LIFECYCLES **/
	// keep the newest message in view while the window is open
	useEffect(() => {
		if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
	}, [open, chat.messages.length]);

	/** HANDLERS **/
	const toggle = () => {
		setSeen(chat.messages.length);
		setOpen(!open);
	};
	const send = (e: React.FormEvent) => {
		e.preventDefault();
		const message = text.trim();
		if (!message || !canSend) return;
		if (sendChat(message)) setText('');
	};

	const status =
		chat.status === 'blocked'
			? t('chat.blocked')
			: chat.status === 'connecting'
				? t('chat.connecting')
				: chat.status === 'closed'
					? t('chat.reconnecting')
					: '';

	return (
		<div className={`chat ${open ? 'open' : ''}`}>
			{open && (
				<section className="chat-panel" aria-label={t('chat.title')}>
					<header>
						<div>
							<b>{t('chat.title')}</b>
							<span className="chat-online">
								<i />
								{t('chat.online', { count: chat.online })}
							</span>
						</div>
						<button className="chat-close" aria-label={t('chat.close')} onClick={toggle}>
							×
						</button>
					</header>

					<div className="chat-list" ref={listRef}>
						{!chat.messages.length && <p className="chat-empty">{t('chat.empty')}</p>}
						{chat.messages.map((m, i) => {
							const mine = !!user._id && m.memberData?._id === user._id;
							const dealer = m.memberData?.memberType === MemberType.AGENT;
							return (
								<div key={`${m.createdAt}-${i}`} className={`chat-msg ${mine ? 'own' : ''}`}>
									{!mine && <Avatar image={m.memberData?.memberImage} dealer={dealer} />}
									<div>
										{!mine && (
											<small className="chat-who">
												{m.memberData?.memberNick ?? t('chat.guest')}
												{dealer && <em>{t('board.dealer')}</em>}
											</small>
										)}
										<p>{m.text}</p>
										<small className="chat-time">{fmt.timeAgo(m.createdAt)}</small>
									</div>
								</div>
							);
						})}
					</div>

					{status && <div className="chat-status">{status}</div>}

					{user._id ? (
						<form className="chat-input" onSubmit={send}>
							<input
								value={text}
								maxLength={MAX_LENGTH}
								placeholder={t('chat.placeholder')}
								disabled={!canSend}
								onChange={(e) => setText(e.target.value)}
							/>
							<button className="btn primary sm" disabled={!canSend || !text.trim()}>
								{t('chat.send')}
							</button>
						</form>
					) : (
						<div className="chat-guest">
							<span>{t('chat.guestNote')}</span>
							<Link href="/account/join?mode=login" className="btn primary sm">
								{t('nav.logIn')}
							</Link>
						</div>
					)}
					{chat.error && <div className="chat-error">{translateServerMessage(chat.error)}</div>}
				</section>
			)}

			<button className="chat-fab" aria-label={open ? t('chat.close') : t('chat.title')} onClick={toggle}>
				<BubbleIcon />
				{unread > 0 && <span className="chat-unread">{unread > 9 ? '9+' : unread}</span>}
				{!open && chat.online > 0 && <span className="chat-count">{chat.online}</span>}
			</button>
		</div>
	);
};

export default Chat;
