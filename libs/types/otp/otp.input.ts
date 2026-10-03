import { OtpPurpose } from '../../enums/otp.enum';

export interface RequestOtpInput {
	otpPhone: string;
	otpPurpose: OtpPurpose;
}

export interface VerifyOtpInput {
	otpPhone: string;
	otpPurpose: OtpPurpose;
	otpCode: string;
}

export interface ResetPasswordInput {
	resetToken: string;
	newPassword: string;
}
