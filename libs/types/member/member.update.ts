import { MemberStatus, MemberType } from '../../enums/member.enum';

export interface MemberUpdate {
	memberNick?: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	contactPhone?: string;
	contactEmail?: string;
	contactTelegram?: string;
	contactWhatsapp?: string;
	contactKakao?: string;
}

export interface MemberUpdateByAdmin {
	_id: string;
	memberType?: MemberType;
	memberStatus?: MemberStatus;
	agentRejectReason?: string;
}
