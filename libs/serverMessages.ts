import { i18n } from 'next-i18next/pages';

// the API's messages people often see (English, from the backend) -> their translation keys
const keys: Record<string, string> = {
	'Something went wrong!': 'errors.somethingWrong',
	'Wrong nick or password!': 'errors.wrongLogin',
	'This nick is already taken!': 'errors.usedNick',
	'This phone number is already registered!': 'errors.usedPhone',
	'This business number is already registered!': 'errors.usedBusinessNo',
	'Your account has been blocked. Contact support.': 'errors.blocked',
	'You are not authenticated, please login first!': 'errors.notAuthenticated',
	'Your agent account is under review. Usually within 24 hours.': 'errors.underReview',
	'Your agent application was rejected': 'errors.rejected',
	'This account is no longer available.': 'errors.unavailable',
	'Could not send SMS. Please try again later.': 'errors.smsFailed',
	'Too many code requests. Please try again later.': 'errors.otpTooMany',
	'Please wait a minute before requesting a new code.': 'errors.otpWait',
	'The code has expired. Please request a new one.': 'errors.otpExpired',
	'Wrong code': 'errors.otpWrong',
	'Please verify your phone number first.': 'errors.phoneNotVerified',
	'Invalid or expired reset token. Please start over.': 'errors.resetInvalid',
	'Wrong password.': 'errors.wrongPassword',
	'The new password must be different from the current one.': 'errors.samePassword',
	'Please provide jpg, jpeg, png or webp images!': 'errors.imageFormat',
	'The file is not a valid image.': 'errors.invalidImage',
	'Upload failed!': 'errors.uploadFailed',
	'You cannot like yourself.': 'errors.selfLike',
	'You cannot follow yourself.': 'errors.selfFollow',
	'You cannot like your own car or article.': 'errors.ownLike',
	'You are not allowed to like this (blocked by the owner).': 'errors.likeBlocked',
	'You are not allowed to comment here (blocked by the owner).': 'errors.commentBlocked',
	'You are not allowed to follow this agent (blocked by the agent).': 'errors.followBlocked',
	'Test drives are not available for this car.': 'errors.tdNotAvailable',
	'You cannot request a test drive for your own car.': 'errors.tdOwnCar',
	'You are not allowed to request a test drive here (blocked by the agent).': 'errors.tdBlocked',
	'Pick a date and time in the future, within the next 60 days.': 'errors.tdDate',
	'You already have an open test drive for this car.': 'errors.tdAlreadyOpen',
	'You have too many open test-drive requests. Wait for answers or cancel some.': 'errors.tdTooMany',
	'This car is no longer on sale.': 'errors.tdCarNotActive',
};

/** the message in the visitor's language when we know it; anything else (admin-only messages) stays as the API wrote it */
export const translateServerMessage = (message: string): string => {
	const key = keys[message];
	return key && i18n ? i18n.t(`common:${key}`) : message;
};
