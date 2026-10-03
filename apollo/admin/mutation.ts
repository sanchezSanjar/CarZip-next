import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const CREATE_AGENT_BY_ADMIN = gql`
	mutation CreateAgentByAdmin($input: AgentInputByAdmin!) {
		createAgentByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			agentCompany
			createdAt
		}
	}
`;

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdateByAdmin!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
			agentRejectReason
			agentApprovedAt
			updatedAt
		}
	}
`;

/**************************
 *           CAR          *
 *************************/

export const UPDATE_CAR_BY_ADMIN = gql`
	mutation UpdateCarByAdmin($input: CarUpdateByAdmin!) {
		updateCarByAdmin(input: $input) {
			_id
			carStatus
			carHoldReason
			updatedAt
		}
	}
`;

export const REMOVE_CAR_BY_ADMIN = gql`
	mutation RemoveCarByAdmin($input: String!) {
		removeCarByAdmin(carId: $input) {
			_id
			carTitle
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdateByAdmin!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleStatus
			updatedAt
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
			articleTitle
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
			commentContent
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const CREATE_NOTICE = gql`
	mutation CreateNotice($input: NoticeInput!) {
		createNotice(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			createdAt
		}
	}
`;

export const UPDATE_NOTICE = gql`
	mutation UpdateNotice($input: NoticeUpdate!) {
		updateNotice(input: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			updatedAt
		}
	}
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
	mutation RemoveNoticeByAdmin($input: String!) {
		removeNoticeByAdmin(noticeId: $input) {
			_id
			noticeTitle
		}
	}
`;
