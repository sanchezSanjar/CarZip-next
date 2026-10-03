import { jwtDecode } from 'jwt-decode';
import { CombinedGraphQLErrors } from '@apollo/client';
import { initializeApollo } from '../../apollo/client';
import { emptyUser, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, REQUEST_OTP, SIGN_UP, VERIFY_OTP } from '../../apollo/user/mutation';
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

/** the server's message is written for people, so it can be shown as is */
export const getErrorMessage = (err: unknown): string => {
	if (CombinedGraphQLErrors.is(err)) return err.errors[0]?.message ?? 'Something went wrong!';
	if (err instanceof Error) return err.message;
	return 'Something went wrong!';
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

/** step 1 of signup: text a 6-digit code to the phone */
export const requestSignupCode = async (phone: string): Promise<void> => {
	const apolloClient = initializeApollo();
	await apolloClient.mutate({
		mutation: REQUEST_OTP,
		variables: { input: { otpPhone: phone, otpPurpose: OtpPurpose.SIGNUP } },
		fetchPolicy: 'no-cache',
	});
};

/** step 2 of signup: check the code. Signup must follow within 15 minutes */
export const verifySignupCode = async (phone: string, code: string): Promise<void> => {
	const apolloClient = initializeApollo();
	await apolloClient.mutate({
		mutation: VERIFY_OTP,
		variables: { input: { otpPhone: phone, otpPurpose: OtpPurpose.SIGNUP, otpCode: code } },
		fetchPolicy: 'no-cache',
	});
};

/**
 * step 3 of signup. A USER is logged in right away.
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
