import { jwtDecode } from 'jwt-decode';
import { CombinedGraphQLErrors } from '@apollo/client';
import { initializeApollo } from '../../apollo/client';
import { connectChat } from '../../apollo/socket';
import { authReadyVar, emptyUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { translateServerMessage } from '../serverMessages';
import { LOGIN, REQUEST_OTP, RESET_PASSWORD, SIGN_UP, VERIFY_OTP } from '../../apollo/user/mutation';
import { MemberType } from '../enums/member.enum';
import { OtpPurpose } from '../enums/otp.enum';
import { Member } from '../types/member/member';
import { MemberInput } from '../types/member/member.input';
import {
	endSession,
	getDevice,
	hasSession,
	onSessionChange,
	peekAccessToken,
	restoreSession,
	adoptAccessToken,
	startSession,
} from './session';

export { getAccessToken, hasSession, peekAccessToken } from './session';

/** the server's message is written for people, so it can be shown (translated when we know it) */
export const getErrorMessage = (err: unknown): string => {
	if (CombinedGraphQLErrors.is(err)) return translateServerMessage(err.errors[0]?.message ?? 'Something went wrong!');
	if (err instanceof Error) return translateServerMessage(err.message);
	return translateServerMessage('Something went wrong!');
};

let started = false;

/**
 * Page load (once, from _app): every change of the access token updates the member shown in the header and
 * the live chat's login; then the saved login is restored. Pages that need a login wait for authReadyVar.
 */
export const initAuth = (): void => {
	if (started || typeof window === 'undefined') return;
	started = true;
	onSessionChange((token) => {
		if (token) updateUserInfo(token);
		else deleteUserInfo();
		connectChat(token);
	});
	connectChat(peekAccessToken()); // the chat opens as a guest right away, the login follows
	restoreSession().finally(() => authReadyVar(true));
};

/** login accepts a nickname OR a phone number (digits only, starting with 01) */
export const logIn = async (nickOrPhone: string, password: string): Promise<void> => {
	const apolloClient = initializeApollo();
	const isPhone = /^01\d{8,9}$/.test(nickOrPhone.replace(/-/g, ''));
	const input = {
		...(isPhone ? { memberPhone: nickOrPhone.replace(/-/g, '') } : { memberNick: nickOrPhone }),
		memberPassword: password,
		device: getDevice(), // this browser: a 15-minute access token and a refresh token (session.ts)
	};

	let member: Member | undefined;
	try {
		const result = await apolloClient.mutate<{ login: Member }>({
			mutation: LOGIN,
			variables: { input },
			fetchPolicy: 'no-cache',
		});
		member = result.data?.login;
	} catch (err) {
		await sweetMixinErrorAlert(getErrorMessage(err));
		throw new Error('token error');
	}
	if (!member?.accessToken || !member.refreshToken) throw new Error('Login Err');
	await becomeMember({ accessToken: member.accessToken, refreshToken: member.refreshToken });
};

/** texts a 6-digit code to the phone (signup, forgot password, change phone) */
export const requestOtp = async (phone: string, purpose: OtpPurpose): Promise<string> => {
	const apolloClient = initializeApollo();
	const result = await apolloClient.mutate<{ requestOtp: string }>({
		mutation: REQUEST_OTP,
		variables: { input: { otpPhone: phone, otpPurpose: purpose } },
		fetchPolicy: 'no-cache',
	});
	return result.data?.requestOtp ?? '';
};

/** checks the code. For RESET_PASSWORD it returns a resetToken (valid 10 minutes) */
export const verifyOtp = async (phone: string, purpose: OtpPurpose, code: string): Promise<string | undefined> => {
	const apolloClient = initializeApollo();
	const result = await apolloClient.mutate<{ verifyOtp: { message: string; resetToken?: string } }>({
		mutation: VERIFY_OTP,
		variables: { input: { otpPhone: phone, otpPurpose: purpose, otpCode: code } },
		fetchPolicy: 'no-cache',
	});
	return result.data?.verifyOtp.resetToken ?? undefined;
};

/** sets a new password with the resetToken from verifyOtp. Every old login stops working */
export const resetPassword = async (resetToken: string, newPassword: string): Promise<void> => {
	const apolloClient = initializeApollo();
	await apolloClient.mutate({
		mutation: RESET_PASSWORD,
		variables: { input: { resetToken, newPassword } },
		fetchPolicy: 'no-cache',
	});
};

/**
 * last step of signup (after verifyOtp with SIGNUP). A USER is logged in right away.
 * An AGENT gets no token: the account stays PENDING until an admin approves it.
 */
export const signUp = async (input: MemberInput): Promise<Member> => {
	const apolloClient = initializeApollo();
	try {
		const result = await apolloClient.mutate<{ signup: Member }>({
			mutation: SIGN_UP,
			variables: { input: { ...input, device: getDevice() } },
			fetchPolicy: 'no-cache',
		});
		const member = result.data!.signup;

		if (member.memberType === MemberType.USER && member.accessToken && member.refreshToken) {
			await becomeMember({ accessToken: member.accessToken, refreshToken: member.refreshToken });
		}
		return member;
	} catch (err) {
		await sweetMixinErrorAlert(getErrorMessage(err));
		throw new Error('signup error');
	}
};

/** a new login: another account (or a guest) was here, so its cached data is forgotten and loaded again */
const becomeMember = async (tokens: { accessToken: string; refreshToken: string }): Promise<void> => {
	const isNewLogin = jwtDecode<CustomJwtPayload>(tokens.accessToken)._id !== userVar()._id;
	startSession(tokens); // the session listener (initAuth) fills userVar and logs the chat in
	if (isNewLogin) await initializeApollo().resetStore().catch(() => undefined);
};

/** the same session got a new access token (a nick change or a password change answered with one) */
export const applyAccessToken = (token: string): void => {
	adoptAccessToken(token);
};

export const updateUserInfo = (jwtToken: string) => {
	if (!jwtToken) return false;

	try {
		const claims = jwtDecode<CustomJwtPayload>(jwtToken);
		userVar({
			_id: claims._id ?? '',
			memberNick: claims.memberNick ?? '',
			memberType: claims.memberType ?? '',
			memberStatus: claims.memberStatus ?? '',
		});
	} catch {
		logOut(); // not a valid token
	}
};

/** this browser logs out: the session ends on the server too, and the next person here sees nothing of this member */
export const logOut = (): Promise<void> => {
	const wasLoggedIn = hasSession() || !!peekAccessToken();
	deleteUserInfo();
	// the next person on this browser must not see this member's likes, lists or notifications
	initializeApollo().clearStore().catch(() => undefined);
	return wasLoggedIn ? endSession() : Promise.resolve();
};

const deleteUserInfo = () => {
	userVar(emptyUser);
};
