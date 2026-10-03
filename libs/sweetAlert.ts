import Swal from 'sweetalert2';
import 'animate.css';
import { i18n } from 'next-i18next/pages';

// dialog buttons in the visitor's language (the English word until translations have loaded)
const translate = (key: string, fallback: string, options?: Record<string, unknown>) =>
	i18n?.isInitialized ? i18n.t(`common:${key}`, options ?? {}) : fallback;

const colors = { asphalt: '#1E242B', signal: '#F5A623', stop: '#B3261E' };

export const sweetErrorHandling = async (err: Error) => {
	await Swal.fire({
		icon: 'error',
		text: err.message,
		showConfirmButton: false,
	});
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		position: 'center',
		icon: 'success',
		title: msg.replace('Definer: ', ''),
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await Swal.fire({
		title: msg,
		showClass: { popup: 'animate__bounceIn' },
		showConfirmButton: false,
		timer: duration,
	});
};

/** "are you sure?" for anything that notifies other people or can't be undone */
export const sweetConfirmAlert = (msg: string, confirmText = translate('dlg.confirm', 'Confirm'), danger = false) => {
	return new Promise<boolean>(async (resolve) => {
		await Swal.fire({
			icon: 'question',
			text: msg,
			showClass: { popup: 'animate__bounceIn' },
			showCancelButton: true,
			confirmButtonText: confirmText,
			cancelButtonText: translate('dlg.cancel', 'Cancel'),
			confirmButtonColor: danger ? colors.stop : colors.asphalt,
			cancelButtonColor: '#9AA1A8',
		}).then((response) => resolve(response?.isConfirmed ?? false));
	});
};

export const sweetLoginConfirmAlert = (msg: string, confirmText = 'Log in') => {
	return new Promise<boolean>(async (resolve) => {
		await Swal.fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonColor: colors.signal,
			confirmButtonText: confirmText,
			cancelButtonText: translate('dlg.cancel', 'Cancel'),
			cancelButtonColor: '#9AA1A8',
		}).then((response) => resolve(response?.isConfirmed ?? false));
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await Swal.fire({
		icon: 'success',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

export const sweetBasicAlert = async (text: string) => {
	Swal.fire(text);
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	Swal.fire({
		icon: 'error',
		title: msg,
		showConfirmButton: false,
		timer: duration,
	});
};

/** asks for a short text (e.g. a moderation reason); returns null when cancelled */
export const sweetPromptAlert = async (msg: string, placeholder: string, min = 5, max = 300): Promise<string | null> => {
	const result = await Swal.fire({
		text: msg,
		input: 'textarea',
		inputPlaceholder: placeholder,
		inputAttributes: { maxlength: String(max) },
		showCancelButton: true,
		confirmButtonText: translate('dlg.confirm', 'Confirm'),
		cancelButtonText: translate('dlg.cancel', 'Cancel'),
		confirmButtonColor: colors.stop,
		cancelButtonColor: '#9AA1A8',
		inputValidator: (value) => (value.trim().length < min ? translate('dlg.minChars', `Write at least ${min} characters`, { count: min }) : null),
	});
	return result.isConfirmed ? String(result.value).trim() : null;
};
