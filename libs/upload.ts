import { API_URL } from './config';
import { getJwtToken } from './auth';

export type UploadTarget = 'member' | 'car' | 'article';

export interface UploadedImage {
	url: string; // save this one (memberImage, carImages, articleImage)
	thumbnailUrl: string; // use this one in lists
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 10 * 1024 * 1024;

/** checks files before sending, with the same rules as the server: jpeg/png/webp, max 10 MB each */
export const checkImages = (files: File[]): string | null => {
	const wrongType = files.find((f) => !ALLOWED.includes(f.type));
	if (wrongType) return `${wrongType.name}: only JPG, PNG and WebP images are allowed`;
	const tooBig = files.find((f) => f.size > MAX_BYTES);
	if (tooBig) return `${tooBig.name} is larger than 10 MB`;
	return null;
};

/**
 * Uploads images over REST (not GraphQL). Logged in only. All-or-nothing: one bad file fails the request.
 * The server re-encodes to WebP and strips location data.
 */
export const uploadImages = async (files: File[], target: UploadTarget): Promise<UploadedImage[]> => {
	const problem = checkImages(files);
	if (problem) throw new Error(problem);

	const form = new FormData();
	form.append('target', target);
	files.forEach((file) => form.append('files', file));

	const res = await fetch(`${API_URL}/upload/images`, {
		method: 'POST',
		headers: { Authorization: `Bearer ${getJwtToken()}` },
		body: form,
	});
	const body = await res.json();
	if (!res.ok) throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'Upload failed');
	return body as UploadedImage[];
};
