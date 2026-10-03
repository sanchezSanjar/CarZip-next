import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation SignUp($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberImage
			agentCompany
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberImage
			agentCompany
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			contactPhone
			contactEmail
			contactTelegram
			contactWhatsapp
			contactKakao
			updatedAt
			accessToken
		}
	}
`;

export const CHANGE_PASSWORD = gql`
	mutation ChangePassword($input: ChangePasswordInput!) {
		changePassword(input: $input) {
			_id
			memberNick
			accessToken
		}
	}
`;

export const CHANGE_MEMBER_PHONE = gql`
	mutation ChangeMemberPhone($input: ChangePhoneInput!) {
		changeMemberPhone(input: $input) {
			_id
			memberPhone
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberLikes
		}
	}
`;

/**************************
 *           OTP          *
 *************************/

export const REQUEST_OTP = gql`
	mutation RequestOtp($input: RequestOtpInput!) {
		requestOtp(input: $input)
	}
`;

export const VERIFY_OTP = gql`
	mutation VerifyOtp($input: VerifyOtpInput!) {
		verifyOtp(input: $input) {
			message
			resetToken
		}
	}
`;

export const RESET_PASSWORD = gql`
	mutation ResetPassword($input: ResetPasswordInput!) {
		resetPassword(input: $input)
	}
`;

/**************************
 *           CAR          *
 *************************/

export const CREATE_CAR = gql`
	mutation CreateCar($input: CarInput!) {
		createCar(input: $input) {
			_id
			carStatus
			carTitle
			createdAt
		}
	}
`;

export const UPDATE_CAR = gql`
	mutation UpdateCar($input: CarUpdate!) {
		updateCar(input: $input) {
			_id
			carStatus
			carTitle
			carPrice
			carPriceUsd
			soldAt
			deletedAt
			updatedAt
		}
	}
`;

export const CONFIRM_CAR_LISTING = gql`
	mutation ConfirmCarListing($input: String!) {
		confirmCarListing(carId: $input) {
			_id
			carConfirmedAt
		}
	}
`;

export const LIKE_TARGET_CAR = gql`
	mutation LikeTargetCar($input: String!) {
		likeTargetCar(carId: $input) {
			_id
			carLikes
		}
	}
`;

/**************************
 *       TEST DRIVE       *
 *************************/

export const REQUEST_TEST_DRIVE = gql`
	mutation RequestTestDrive($input: TestDriveInput!) {
		requestTestDrive(input: $input) {
			_id
			testDriveStatus
			testDriveDate
			testDriveMessage
			carId
			createdAt
		}
	}
`;

export const UPDATE_TEST_DRIVE = gql`
	mutation UpdateTestDrive($input: TestDriveUpdate!) {
		updateTestDrive(input: $input) {
			_id
			testDriveStatus
			updatedAt
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleTitle
			createdAt
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleStatus
			articleTitle
			articleContent
			articleImage
			updatedAt
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleLikes
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentGroup
			commentContent
			commentRefId
			createdAt
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentContent
			updatedAt
		}
	}
`;

/**************************
 *         FOLLOW        *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

/**************************
 *         BLOCK          *
 *************************/

export const BLOCK_MEMBER = gql`
	mutation BlockMember($input: String!) {
		blockMember(memberId: $input) {
			_id
			blockedId
		}
	}
`;

export const UNBLOCK_MEMBER = gql`
	mutation UnblockMember($input: String!) {
		unblockMember(memberId: $input) {
			_id
			blockedId
		}
	}
`;

/**************************
 *      NOTIFICATION      *
 *************************/

export const MARK_NOTIFICATIONS_READ = gql`
	mutation MarkNotificationsRead($input: NotificationsRead!) {
		markNotificationsRead(input: $input)
	}
`;
