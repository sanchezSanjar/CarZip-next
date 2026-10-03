import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';
import { ChatState } from '../libs/types/chat/chat';

export const emptyUser: CustomJwtPayload = {
	_id: '',
	memberNick: '',
	memberType: '',
	memberStatus: '',
};

// the logged-in member, filled from the access token
export const userVar = makeVar<CustomJwtPayload>(emptyUser);

// the live-chat connection and what the chat window shows (filled by apollo/socket.ts)
export const socketVar = makeVar<WebSocket | null>(null);
export const chatVar = makeVar<ChatState>({ status: 'connecting', messages: [], online: 0, error: '' });
