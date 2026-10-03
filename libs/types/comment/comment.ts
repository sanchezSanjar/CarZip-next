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
	/** only in my own list: the car / article / dealer the comment is on (null if it is gone) */
	targetData?: { title: string; image?: string | null } | null;
}

export interface Comments {
	list: Comment[];
	metaCounter?: TotalCounter[];
}
