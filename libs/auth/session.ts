import { jwtDecode } from 'jwt-decode';
import { GRAPHQL_URL } from '../config';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { DeviceInput } from '../types/member/member.input';

/**
 * The website's login session, the same flow the mobile app uses (backend API.md §2):
 * - access token: a JWT that lasts 15 minutes, kept in MEMORY only (one per browser tab). A script injected
 *   into the page gets at most 15 minutes, not the 30 days of the old token in localStorage.
 * - refresh token: 60 days, kept in localStorage, works ONCE: every refresh returns a new pair, and a used
 *   token that comes back ends the whole session (someone had a copy).
 * Several tabs share one refresh token, so a refresh takes a browser-wide lock (Web Locks API) and reads the
 * newest token inside it: two tabs refreshing at the same moment never send the same token twice.
 */

export const REFRESH_TOKEN_KEY = 'carzip.refreshToken';
const DEVICE_ID_KEY = 'carzip.deviceId';
const REFRESH_LOCK = 'carzip.refresh';
const EXPIRY_MARGIN = 30; // seconds: an access token this close to its end is refreshed before it is sent

export interface SessionTokens {
	accessToken: string;
	refreshToken: string;
}

/** called with the new access token on login, refresh and "same session, new token"; with "" on logout */
export type SessionListener = (accessToken: string) => void;

/** a GraphQL error answer (as opposed to no answer at all: offline, server down) */
export class ApiError extends Error {
	constructor(
		message: string,
		public readonly code?: string,
	) {
		super(message);
	}
}

const REFRESH_TOKENS = `mutation RefreshTokens($refreshToken: String!) {
	refreshTokens(refreshToken: $refreshToken) { accessToken refreshToken }
}`;
const LOGOUT = `mutation Logout($refreshToken: String!) { logout(refreshToken: $refreshToken) }`;

let accessToken = '';
let refreshing: Promise<string> | null = null;
const listeners = new Set<SessionListener>();

const inBrowser = () => typeof window !== 'undefined' && !!window.localStorage;
const storedRefreshToken = () => (inBrowser() ? (localStorage.getItem(REFRESH_TOKEN_KEY) ?? '') : '');

/** true when a refresh token is stored: the member is (or can be) logged in, even before the first refresh */
export const hasSession = (): boolean => !!storedRefreshToken();

/** the access token in memory right now, without refreshing ("" = guest) */
export const peekAccessToken = (): string => accessToken;

export function onSessionChange(listener: SessionListener): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

/** seconds until the token expires (negative when it already has; 0 when it carries no expiry or is not a JWT) */
const secondsLeft = (token: string): number => {
	try {
		const { exp } = jwtDecode<CustomJwtPayload>(token);
		return exp ? exp - Date.now() / 1000 : 0;
	} catch {
		return 0;
	}
};

function setAccessToken(token: string): void {
	accessToken = token;
	listeners.forEach((listener) => listener(token));
}

/** login / signup answered with a device: keep the refresh token, use the access token */
export function startSession(tokens: SessionTokens): void {
	if (inBrowser()) localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
	setAccessToken(tokens.accessToken);
}

/** the same session got a fresh access token (updateMember after a nick change, changePassword) */
export function adoptAccessToken(token: string): void {
	setAccessToken(token);
}

/** forget the session in this browser (no request): logout, or the server refused the refresh token */
export function clearSession(): void {
	if (inBrowser()) localStorage.removeItem(REFRESH_TOKEN_KEY);
	setAccessToken('');
}

/**
 * The access token to send: the one in memory while it has time left, otherwise a refreshed one.
 * "" for a guest, and also when a refresh is not possible right now (offline).
 */
export async function getAccessToken(): Promise<string> {
	if (accessToken && secondsLeft(accessToken) > EXPIRY_MARGIN) return accessToken;
	if (!hasSession()) return '';
	return refreshAccessToken();
}

/**
 * New tokens for the stored refresh token. Only ONE refresh runs at a time in this tab (every caller waits
 * for it) and one at a time across tabs (the lock), and the stored token is read INSIDE the lock, so it is
 * always the newest one. Refused by the server (expired, used, logged out, password changed, blocked):
 * the session ends here. No answer at all (offline): the refresh token is kept and tried again later.
 */
export function refreshAccessToken(): Promise<string> {
	refreshing ??= withLock(async () => {
		const refreshToken = storedRefreshToken();
		if (!refreshToken) {
			setAccessToken('');
			return '';
		}
		try {
			const data = await graphqlRequest<{ refreshTokens: SessionTokens }>(REFRESH_TOKENS, { refreshToken });
			startSession(data.refreshTokens);
			return data.refreshTokens.accessToken;
		} catch (err) {
			if (err instanceof ApiError && (err.code === 'UNAUTHENTICATED' || err.code === 'FORBIDDEN')) clearSession();
			return '';
		}
	}).finally(() => {
		refreshing = null;
	});
	return refreshing;
}

/** page load: a stored refresh token logs the member in again, without the password. "" = guest */
export async function restoreSession(): Promise<string> {
	if (!hasSession()) return '';
	return refreshAccessToken();
}

/** this browser only. Logged out here even when the server can't be reached */
export async function endSession(): Promise<void> {
	const refreshToken = storedRefreshToken();
	clearSession();
	if (refreshToken) await graphqlRequest(LOGOUT, { refreshToken }).catch(() => undefined);
}

/** this browser as a device: an id made once and kept, so logging in again ends the previous session here */
export function getDevice(): DeviceInput {
	let deviceId = inBrowser() ? localStorage.getItem(DEVICE_ID_KEY) : null;
	if (!deviceId) {
		deviceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `web-${Date.now()}-${Math.random()}`;
		if (inBrowser()) localStorage.setItem(DEVICE_ID_KEY, deviceId);
	}
	return { deviceId, deviceName: browserName(), devicePlatform: 'WEB' };
}

/** "Chrome on Windows": for a future "my devices" list */
export function browserName(agent = typeof navigator !== 'undefined' ? navigator.userAgent : ''): string {
	const browser = /Edg\//.test(agent)
		? 'Edge'
		: /OPR\//.test(agent)
			? 'Opera'
			: /Chrome\//.test(agent)
				? 'Chrome'
				: /Safari\//.test(agent)
					? 'Safari'
					: /Firefox\//.test(agent)
						? 'Firefox'
						: 'Browser';
	const os = /Windows/.test(agent)
		? 'Windows'
		: /iPhone|iPad/.test(agent)
			? 'iOS'
			: /Android/.test(agent)
				? 'Android'
				: /Mac OS/.test(agent)
					? 'macOS'
					: /Linux/.test(agent)
						? 'Linux'
						: '';
	return os ? `${browser} on ${os}` : browser;
}

/** one refresh at a time across the browser's tabs; without the Web Locks API (old browsers) it just runs */
function withLock<T>(task: () => Promise<T>): Promise<T> {
	const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
	return locks ? (locks.request(REFRESH_LOCK, task) as Promise<T>) : task();
}

/** a plain GraphQL request over fetch (not Apollo): the refresh must not go through the links that call it */
async function graphqlRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
	const response = await fetch(GRAPHQL_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ query, variables }),
	});
	const body = (await response.json().catch(() => ({}))) as {
		data?: T;
		errors?: { message: string; extensions?: { code?: string } }[];
	};
	if (body.errors?.length) throw new ApiError(body.errors[0].message, body.errors[0].extensions?.code);
	if (!response.ok || !body.data) throw new Error(`GraphQL request failed (${response.status})`);
	return body.data;
}

/**
 * Other tabs: a logout there (the refresh token disappears) logs this tab out too; a login there gives this
 * tab a session, so its next request logs in as well.
 */
if (inBrowser()) {
	window.addEventListener('storage', (event) => {
		if (event.key !== REFRESH_TOKEN_KEY) return;
		if (!event.newValue) setAccessToken('');
		else if (!accessToken) void refreshAccessToken();
	});
}
