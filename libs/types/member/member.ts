import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';
import { MeFollowed } from '../follow/follow';
import { MeLiked } from '../like/like';

export interface AgentPublic {
	_id: string;
	memberNick: string;
	memberImage?: string;
	agentCompany?: string;
	memberRank: number;
	contactPhone?: string;
	contactEmail?: string;
	contactTelegram?: string;
	contactWhatsapp?: string;
	contactKakao?: string;
}

export interface Member {
	_id: string;
	memberType: MemberType;
	memberStatus: MemberStatus;
	memberAuthType: MemberAuthType;
	memberPhone?: string;
	memberNick: string;
	memberFullName?: string;
	memberImage: string;
	memberAddress?: string;
	memberDesc?: string;
	memberCars: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberPoints: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberRank: number;
	memberWarnings?: number;
	memberBlocks?: number;
	agentCompany?: string;
	agentBusinessNo?: string;
	agentBusinessCard?: string;
	agentRejectReason?: string;
	agentApprovedAt?: Date;
	contactPhone?: string;
	contactEmail?: string;
	contactTelegram?: string;
	contactWhatsapp?: string;
	contactKakao?: string;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	accessToken?: string;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
	meBlocked?: boolean;
}

export interface TotalCounter {
	total?: number;
}

export interface Members {
	list: Member[];
	metaCounter?: TotalCounter[];
}
