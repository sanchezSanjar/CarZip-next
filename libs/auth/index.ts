import { jwtDecode } from 'jwt-decode';
import { CombinedGraphQLErrors } from '@apollo/client';
import { initializeApollo } from '../../apollo/client';
import { emptyUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { translateServerMessage } from '../serverMessages';
import { LOGIN, REQUEST_OTP, RESET_PASSWORD, SIGN_UP, VERIFY_OTP } from '../../apollo/user/mutation';
import { MemberType } from '../enums/member.enum';
import { OtpPurpose } from '../enums/otp.enum';
import { Member } from '../types/member/member';
import { MemberInput } from '../types/member/member.input';

export function getJwtToken(): string {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
	return '';
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

/** the server's message is written for people, so it can be shown (translated when we know it) */
export const getErrorMessage = (err: unknown): string => {
	if (CombinedGraphQLErrors.is(err)) return translateServerMessage(err.errors[0]?.message ?? 'Something went wrong!');
	if (err instanceof Error) return translateServerMessage(err.message);
	return translateServerMessage('Something went wrong!');
};

/** login accepts a nickname OR a phone number (digits only, starting with 01) */
export const logIn = async (nickOrPhone: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nickOrPhone, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
		throw new Error('Login Err');
	}
};

const requestJwtToken = async ({
	nickOrPhone,
	password,
}: {
	nickOrPhone: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = initializeApollo();
	const isPhone = /^01\d{8,9}$/.test(nickOrPhone.replace(/-/g, ''));
	const input = isPhone
		? { memberPhone: nickOrPhone.replace(/-/g, ''), memberPassword: password }
		: { memberNick: nickOrPhone, memberPassword: password };

	try {
		const result = await apolloClient.mutate<{ login: Member }>({
			mutation: LOGIN,
			variables: { input },
			fetchPolicy: 'no-cache',
		});

		return { jwtToken: result.data?.login.accessToken ?? '' };
	} catch (err) {
		await sweetMixinErrorAlert(getErrorMessage(err));
		throw new Error('token error');
	}
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
			variables: { input },
			fetchPolicy: 'no-cache',
		});
		const member = result.data!.signup;

		if (member.memberType === MemberType.USER && member.accessToken) {
			updateStorage({ jwtToken: member.accessToken });
			updateUserInfo(member.accessToken);
		}
		return member;
	} catch (err) {
		await sweetMixinErrorAlert(getErrorMessage(err));
		throw new Error('signup error');
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: string }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
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

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar(emptyUser);
};
