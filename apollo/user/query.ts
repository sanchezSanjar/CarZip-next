import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_AGENTS = gql`
	query GetAgents($input: AgentsInquiry!) {
		getAgents(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberImage
				memberAddress
				memberDesc
				agentCompany
				memberCars
				memberArticles
				memberFollowers
				memberLikes
				memberViews
				memberRank
				contactPhone
				contactEmail
				contactTelegram
				contactWhatsapp
				contactKakao
				createdAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql`
	query GetMember($input: String!) {
		getMember(targetId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberCars
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberRank
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
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meFollowed {
				followingId
				followerId
				myFollowing
			}
			meBlocked
		}
	}
`;

/**************************
 *           CAR          *
 *************************/

/** welcome page numbers, counted by the API (cached there for a minute) */
export const GET_CAR_STATS = gql`
	query GetCarStats {
		getCarStats {
			total
			dealers
			brands {
				value
				count
			}
			types {
				value
				count
			}
			fuels {
				value
				count
			}
			locations {
				value
				count
			}
		}
	}
`;

export const GET_CAR_CATALOG = gql`
	query GetCarCatalog {
		getCarCatalog {
			brand
			models
		}
	}
`;

export const GET_CARS = gql`
	query GetCars($input: CarsInquiry!) {
		getCars(input: $input) {
			list {
				_id
				carType
				carStatus
				carBrand
				carModel
				carYear
				carMileage
				carColor
				carFuelType
				carTransmission
				carLocation
				carTitle
				carMarket
				carPrice
				carPriceUsd
				carImages
				carBarter
				carRent
				carTestDrive
				carViews
				carLikes
				carComments
				carRank
				memberId
				createdAt
				agentData {
					_id
					memberNick
					memberImage
					agentCompany
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			nextCursor
		}
	}
`;

export const GET_CAR = gql`
	query GetCar($input: String!) {
		getCar(carId: $input) {
			_id
			carType
			carStatus
			carBrand
			carModel
			carYear
			carMileage
			carColor
			carCondition
			carFuelType
			carTransmission
			carLocation
			carAddress
			carTitle
			carMarket
			carPrice
			carPriceUsd
			carRentPrice
			carExportAgreedAt
			carImages
			carDesc
			carOptions
			carBarter
			carRent
			carTestDrive
			carViews
			carLikes
			carComments
			carRank
			memberId
			soldAt
			carConfirmedAt
			createdAt
			updatedAt
			agentData {
				_id
				memberNick
				memberImage
				agentCompany
				memberRank
				contactPhone
				contactEmail
				contactTelegram
				contactWhatsapp
				contactKakao
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_AGENT_CARS = gql`
	query GetAgentCars($input: AgentCarsInquiry!) {
		getAgentCars(input: $input) {
			list {
				_id
				carStatus
				carBrand
				carModel
				carYear
				carMileage
				carTitle
				carMarket
				carPrice
				carPriceUsd
				carImages
				carBarter
				carRent
				carTestDrive
				carViews
				carLikes
				carComments
				carHoldReason
				carConfirmedAt
				soldAt
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list {
				_id
				carStatus
				carBrand
				carModel
				carYear
				carMileage
				carFuelType
				carTransmission
				carLocation
				carTitle
				carMarket
				carPrice
				carPriceUsd
				carImages
				carBarter
				carRent
				carTestDrive
				carLikes
				memberId
				soldAt
				agentData {
					_id
					memberNick
					memberImage
					agentCompany
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list {
				_id
				carStatus
				carBrand
				carModel
				carYear
				carMileage
				carFuelType
				carTransmission
				carLocation
				carTitle
				carMarket
				carPrice
				carPriceUsd
				carImages
				carBarter
				carRent
				carTestDrive
				carLikes
				memberId
				soldAt
				agentData {
					_id
					memberNick
					memberImage
					agentCompany
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *       TEST DRIVE       *
 *************************/

export const GET_MY_TEST_DRIVES = gql`
	query GetMyTestDrives($input: TestDrivesInquiry!) {
		getMyTestDrives(input: $input) {
			list {
				_id
				testDriveStatus
				testDriveDate
				testDriveMessage
				carId
				sellerId
				createdAt
				carData {
					_id
					carTitle
					carBrand
					carModel
					carYear
					carStatus
					carImages
				}
				sellerData {
					_id
					memberNick
					memberImage
					agentCompany
					contactPhone
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_AGENT_TEST_DRIVES = gql`
	query GetAgentTestDrives($input: TestDrivesInquiry!) {
		getAgentTestDrives(input: $input) {
			list {
				_id
				testDriveStatus
				testDriveDate
				testDriveMessage
				carId
				memberId
				createdAt
				carData {
					_id
					carTitle
					carBrand
					carModel
					carYear
					carStatus
					carImages
				}
				buyerData {
					_id
					memberNick
					memberImage
					memberPhone
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

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
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
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
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
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
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

/** my own comments everywhere, each with the title and photo of what it is on */
export const GET_MY_COMMENTS = gql`
	query GetMyComments($input: MyCommentsInquiry!) {
		getMyComments(input: $input) {
			list {
				_id
				commentGroup
				commentContent
				commentRefId
				createdAt
				targetData {
					title
					image
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followerData {
					_id
					memberNick
					memberImage
					agentCompany
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				followingData {
					_id
					memberNick
					memberImage
					agentCompany
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meFollowed {
					followingId
					followerId
					myFollowing
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         BLOCK          *
 *************************/

export const GET_MY_BLOCKS = gql`
	query GetMyBlocks($input: OrdinaryInquiry!) {
		getMyBlocks(input: $input) {
			list {
				_id
				blockerId
				blockedId
				createdAt
				blockedData {
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
 *      NOTIFICATION      *
 *************************/

export const GET_NOTIFICATIONS = gql`
	query GetNotifications($input: NotificationsInquiry!) {
		getNotifications(input: $input) {
			list {
				_id
				notificationType
				notificationStatus
				notificationGroup
				notificationTitle
				notificationDesc
				authorId
				receiverId
				carId
				articleId
				createdAt
				authorData {
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

export const GET_UNREAD_NOTIFICATION_COUNT = gql`
	query GetUnreadNotificationCount {
		getUnreadNotificationCount
	}
`;

/**************************
 *         NOTICE         *
 *************************/

export const GET_NOTICES = gql`
	query GetNotices($input: NoticesInquiry!) {
		getNotices(input: $input) {
			list {
				_id
				noticeCategory
				noticeStatus
				noticeTitle
				noticeContent
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_NOTICE = gql`
	query GetNotice($input: String!) {
		getNotice(noticeId: $input) {
			_id
			noticeCategory
			noticeStatus
			noticeTitle
			noticeContent
			createdAt
			updatedAt
		}
	}
`;
