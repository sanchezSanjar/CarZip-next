import { WS_URL } from '../libs/config';
import { ChatMessage } from '../libs/types/chat/chat';
import { chatVar, socketVar } from './store';

const KEEP = 100; // messages kept in the window
const CLOSE_UNAUTHORIZED = 4001; // invalid or expired token
const CLOSE_FORBIDDEN = 4003; // blocked member

let socket: WebSocket | null = null;
let token = '';
let retries = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

const update = (patch: Partial<ReturnType<typeof chatVar>>) => chatVar({ ...chatVar(), ...patch });

/**
 * The one live-chat connection for the whole site (plain WebSocket, see API.md §16).
 * Guests connect without a token and can only read; members send with their token.
 * If the connection drops, it reconnects by itself, waiting a little longer each time (1 s, 2 s, 4 s ... up to 30 s).
 */
const open = () => {
	clearTimeout(retryTimer);
	if (socket) {
		socket.onclose = null; // closing on purpose: no reconnect for this one
		socket.close();
	}
	update({ status: 'connecting', error: '' });
	// the token goes in the address: browsers can't set headers on a WebSocket
	const ws = new WebSocket(token ? `${WS_URL}?token=${encodeURIComponent(token)}` : WS_URL);
	socket = ws;
	socketVar(ws);

	ws.onopen = () => {
		retries = 0;
		update({ status: 'open' });
	};

	ws.onmessage = (e) => {
		let msg: { event?: string; list?: ChatMessage[]; totalClients?: number; message?: string } & Partial<ChatMessage>;
		try {
			msg = JSON.parse(e.data);
		} catch {
			return;
		}
		if (msg.event === 'getMessages') update({ messages: (msg.list ?? []).slice(-KEEP) });
		else if (msg.event === 'message' && msg.text) {
			const message: ChatMessage = { text: msg.text, memberData: msg.memberData ?? null, createdAt: msg.createdAt ?? new Date().toISOString() };
			update({ messages: [...chatVar().messages, message].slice(-KEEP) });
		} else if (msg.event === 'info') update({ online: msg.totalClients ?? 0 });
		else if (msg.event === 'error') update({ error: msg.message ?? '' });
	};

	ws.onclose = (e) => {
		if (socket !== ws) return;
		socket = null;
		socketVar(null);
		if (e.code === CLOSE_UNAUTHORIZED && token) {
			// the token was refused (expired, changed): keep reading as a guest
			token = '';
			return open();
		}
		if (e.code === CLOSE_FORBIDDEN) return update({ status: 'blocked' });
		update({ status: 'closed' });
		retryTimer = setTimeout(open, Math.min(30000, 1000 * 2 ** retries++));
	};
};

/** (re)connect, as a guest (no token) or as the logged-in member; called again after logging in or out */
export const connectChat = (accessToken: string) => {
	if (typeof window === 'undefined') return;
	token = accessToken;
	retries = 0;
	open();
};

/** send one message; false when there's no open connection */
export const sendChat = (text: string): boolean => {
	if (socket?.readyState !== WebSocket.OPEN) return false;
	update({ error: '' });
	socket.send(JSON.stringify({ event: 'message', data: text }));
	return true;
};
