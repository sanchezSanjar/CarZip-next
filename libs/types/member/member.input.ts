import { Direction } from '../../enums/common.enum';
import { MemberAuthType, MemberStatus, MemberType } from '../../enums/member.enum';

export interface AgentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: AISearch;
}

export interface AISearch {
	text?: string;
}

export interface MembersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search?: MISearch;
}

export interface MISearch {
	memberStatus?: MemberStatus;
	memberType?: MemberType;
	text?: string;
}

export interface MemberInput {
	memberNick: string;
	memberPassword: string;
	memberPhone: string;
	memberType?: MemberType;
	memberAuthType?: MemberAuthType;
	memberFullName?: string;
	agentCompany?: string;
	agentBusinessNo?: string;
	agentBusinessCard?: string;
	contactPhone?: string;
	contactEmail?: string;
	contactTelegram?: string;
	contactWhatsapp?: string;
	contactKakao?: string;
}

export interface LoginInput {
	memberNick?: string;
	memberPhone?: string;
	memberPassword: string;
}

export interface ChangePasswordInput {
	oldPassword: string;
	newPassword: string;
}

export interface ChangePhoneInput {
	newPhone: string;
	memberPassword: string;
}

export interface AgentInputByAdmin {
	memberNick: string;
	memberPhone: string;
	memberFullName?: string;
	agentCompany: string;
	agentBusinessNo?: string;
	agentBusinessCard?: string;
	contactPhone?: string;
	contactEmail?: string;
	contactTelegram?: string;
	contactWhatsapp?: string;
	contactKakao?: string;
}
