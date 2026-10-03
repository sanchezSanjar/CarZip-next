import { AgentPublic, TotalCounter } from '../member/member';

export interface Block {
	_id: string;
	blockerId: string;
	blockedId: string;
	createdAt: Date;
	blockedData?: AgentPublic;
}

export interface Blocks {
	list: Block[];
	metaCounter?: TotalCounter[];
}
