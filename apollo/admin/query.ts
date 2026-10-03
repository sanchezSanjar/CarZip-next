import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberAddress
				memberCars
				memberArticles
				memberComments
				memberWarnings
				memberBlocks
				agentCompany
				agentBusinessNo
				agentBusinessCard
				agentRejectReason
				agentApprovedAt
				contactPhone
				contactEmail
				contactTelegram
				contactWhatsapp
				contactKakao
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *           CAR          *
 *************************/

export const GET_ALL_CARS_BY_ADMIN = gql`
	query GetAllCarsByAdmin($input: AllCarsInquiry!) {
		getAllCarsByAdmin(input: $input) {
			list {
				_id
				carStatus
				carBrand
				carModel
				carYear
				carMileage
				carLocation
				carTitle
				carMarket
				carPrice
				carPriceUsd
				carImages
				carViews
				carLikes
				carComments
				carHoldReason
				memberId
				soldAt
				deletedAt
				createdAt
				agentData {
					_id
					memberNick
					memberImage
					agentCompany
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberImage
					agentCompany
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_ALL_NOTICES_BY_ADMIN = gql`
	query GetAllNoticesByAdmin($input: NoticesInquiry!) {
		getAllNoticesByAdmin(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				memberId
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;
