/** the public profile the chat server attaches to a member */
export interface ChatMember {
	_id: string;
	memberNick: string;
	memberImage?: string;
	memberType: string;
}

/** one chat message (the server keeps the latest few and sends them on connect) */
export interface ChatMessage {
	text: string;
	memberData: ChatMember | null;
	createdAt: string;
}

export type ChatStatus = 'connecting' | 'open' | 'closed' | 'blocked';

/** everything the chat window shows */
export interface ChatState {
	status: ChatStatus;
	messages: ChatMessage[];
	/** how many people are in the chat right now */
	online: number;
	/** the server's last refusal (too fast, too long, ...), shown under the input */
	error: string;
}
