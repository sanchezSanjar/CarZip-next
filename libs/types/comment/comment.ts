import { CommentGroup, CommentStatus } from '../../enums/comment.enum';
import { AgentPublic, TotalCounter } from '../member/member';

export interface Comment {
	_id: string;
	commentStatus: CommentStatus;
	commentGroup: CommentGroup;
	commentContent: string;
	commentRefId: string;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
	memberData?: AgentPublic;
}

export interface Comments {
	list: Comment[];
	metaCounter?: TotalCounter[];
}
