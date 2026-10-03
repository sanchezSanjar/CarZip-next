import Swal from 'sweetalert2';
import 'animate.css';

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
export const sweetConfirmAlert = (msg: string, confirmText = 'Confirm', danger = false) => {
	return new Promise<boolean>(async (resolve) => {
		await Swal.fire({
			icon: 'question',
			text: msg,
			showClass: { popup: 'animate__bounceIn' },
			showCancelButton: true,
			confirmButtonText: confirmText,
			confirmButtonColor: danger ? colors.stop : colors.asphalt,
			cancelButtonColor: '#9AA1A8',
		}).then((response) => resolve(response?.isConfirmed ?? false));
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise<boolean>(async (resolve) => {
		await Swal.fire({
			text: msg,
			showCancelButton: true,
			showConfirmButton: true,
			confirmButtonColor: colors.signal,
			confirmButtonText: 'Log in',
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
		confirmButtonText: 'Confirm',
		confirmButtonColor: colors.stop,
		cancelButtonColor: '#9AA1A8',
		inputValidator: (value) => (value.trim().length < min ? `Write at least ${min} characters` : null),
	});
	return result.isConfirmed ? String(result.value).trim() : null;
};
