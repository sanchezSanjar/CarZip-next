import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The session module is loaded fresh for every test (it keeps the access token in module memory), inside a
 * fake browser: a Map as localStorage, a navigator with the Web Locks API, and a fetch that plays the API.
 */

type Session = typeof import('./session');

const REFRESH_KEY = 'carzip.refreshToken';

/** an unsigned JWT with the given claims (the website only reads it, the server checks the signature) */
const jwt = (claims: Record<string, unknown>) => {
	const part = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
	return `${part({ alg: 'HS256', typ: 'JWT' })}.${part(claims)}.signature`;
};
const member = { _id: 'm1', memberNick: 'cz_buyer', memberType: 'USER', memberStatus: 'ACTIVE' };
const accessTokenFor = (secondsLeft: number) => jwt({ ...member, exp: Math.floor(Date.now() / 1000) + secondsLeft });

let store: Map<string, string>;
let storageListeners: ((event: { key: string; newValue: string | null }) => void)[];
let lockRequests: string[];
let apiCalls: { query: string; variables: Record<string, unknown> }[];
/** what the fake API answers to the next requests: data, GraphQL errors, or a network failure */
let apiAnswer: (query: string, variables: Record<string, unknown>) => Promise<{ status?: number; body: unknown }>;

const fakeLocalStorage = () => ({
	getItem: (key: string) => store.get(key) ?? null,
	setItem: (key: string, value: string) => void store.set(key, value),
	removeItem: (key: string) => void store.delete(key),
});

async function load(): Promise<Session> {
	vi.resetModules();
	return import('./session');
}

beforeEach(() => {
	store = new Map();
	storageListeners = [];
	lockRequests = [];
	apiCalls = [];
	apiAnswer = async () => ({ body: { data: {} } });
	const localStorage = fakeLocalStorage();
	vi.stubGlobal('localStorage', localStorage);
	vi.stubGlobal('window', {
		localStorage,
		addEventListener: (type: string, listener: (event: { key: string; newValue: string | null }) => void) => {
			if (type === 'storage') storageListeners.push(listener);
		},
	});
	vi.stubGlobal('navigator', {
		userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
		locks: {
			request: async (name: string, task: () => Promise<unknown>) => {
				lockRequests.push(name);
				return task();
			},
		},
	});
	vi.stubGlobal(
		'fetch',
		vi.fn(async (_url: string, init: { body: string }) => {
			const { query, variables } = JSON.parse(init.body);
			apiCalls.push({ query, variables });
			const { status = 200, body } = await apiAnswer(query, variables);
			return { ok: status < 400, status, json: async () => body };
		}),
	);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

const answerRefresh = (next: { accessToken: string; refreshToken: string }) => {
	apiAnswer = async (query) =>
		query.includes('refreshTokens')
			? { body: { data: { refreshTokens: next } } }
			: { body: { data: { logout: true } } };
};

describe('session: guest', () => {
	it('has no session and sends no request', async () => {
		const session = await load();
		expect(session.hasSession()).toBe(false);
		expect(await session.getAccessToken()).toBe('');
		expect(await session.restoreSession()).toBe('');
		expect(fetch).not.toHaveBeenCalled();
	});
});

describe('session: login', () => {
	it('keeps the refresh token in storage and the access token only in memory', async () => {
		const session = await load();
		const accessToken = accessTokenFor(900);
		session.startSession({ accessToken, refreshToken: 'rt-1' });
		expect(store.get(REFRESH_KEY)).toBe('rt-1');
		expect([...store.values()]).not.toContain(accessToken);
		expect(session.peekAccessToken()).toBe(accessToken);
		expect(session.hasSession()).toBe(true);
	});

	it('tells its listeners about every token change', async () => {
		const session = await load();
		const seen: string[] = [];
		session.onSessionChange((token) => seen.push(token));
		session.startSession({ accessToken: 'a1', refreshToken: 'rt-1' });
		session.adoptAccessToken('a2');
		session.clearSession();
		expect(seen).toEqual(['a1', 'a2', '']);
	});
});

describe('session: the access token to send', () => {
	it('is the one in memory while it has more than 30 seconds left', async () => {
		const session = await load();
		const accessToken = accessTokenFor(120);
		session.startSession({ accessToken, refreshToken: 'rt-1' });
		expect(await session.getAccessToken()).toBe(accessToken);
		expect(fetch).not.toHaveBeenCalled();
	});

	it('is refreshed first when it is about to expire, and the refresh token is rotated', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(10), refreshToken: 'rt-1' });
		const fresh = accessTokenFor(900);
		answerRefresh({ accessToken: fresh, refreshToken: 'rt-2' });

		expect(await session.getAccessToken()).toBe(fresh);
		expect(apiCalls).toHaveLength(1);
		expect(apiCalls[0].variables).toEqual({ refreshToken: 'rt-1' });
		expect(store.get(REFRESH_KEY)).toBe('rt-2');
	});

	it('is refreshed after a page load from the stored refresh token (restoreSession)', async () => {
		store.set(REFRESH_KEY, 'rt-saved');
		const session = await load();
		const fresh = accessTokenFor(900);
		answerRefresh({ accessToken: fresh, refreshToken: 'rt-next' });
		expect(await session.restoreSession()).toBe(fresh);
		expect(apiCalls[0].variables).toEqual({ refreshToken: 'rt-saved' });
	});

	it('many requests at the same moment share ONE refresh (a refresh token works once)', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(5), refreshToken: 'rt-1' });
		answerRefresh({ accessToken: accessTokenFor(900), refreshToken: 'rt-2' });
		const tokens = await Promise.all([session.getAccessToken(), session.getAccessToken(), session.getAccessToken()]);
		expect(new Set(tokens).size).toBe(1);
		expect(apiCalls).toHaveLength(1);
	});

	it('takes the browser-wide lock for the refresh and reads the stored token inside it', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(5), refreshToken: 'rt-old' });
		// another tab refreshed meanwhile and stored a newer token: this tab must use that one, not its own copy
		store.set(REFRESH_KEY, 'rt-from-other-tab');
		answerRefresh({ accessToken: accessTokenFor(900), refreshToken: 'rt-3' });
		await session.getAccessToken();
		expect(lockRequests).toEqual(['carzip.refresh']);
		expect(apiCalls[0].variables).toEqual({ refreshToken: 'rt-from-other-tab' });
	});
});

describe('session: when the refresh fails', () => {
	it('a refused refresh token (used, expired, logged out) ends the session here', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(5), refreshToken: 'rt-1' });
		apiAnswer = async () => ({
			body: { errors: [{ message: 'You are not authenticated', extensions: { code: 'UNAUTHENTICATED' } }] },
		});
		expect(await session.getAccessToken()).toBe('');
		expect(session.hasSession()).toBe(false);
		expect(session.peekAccessToken()).toBe('');
	});

	it('a blocked member is logged out too', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(5), refreshToken: 'rt-1' });
		apiAnswer = async () => ({ body: { errors: [{ message: 'Blocked', extensions: { code: 'FORBIDDEN' } }] } });
		await session.getAccessToken();
		expect(session.hasSession()).toBe(false);
	});

	it('no answer (offline, server down) keeps the refresh token for the next try', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(5), refreshToken: 'rt-1' });
		apiAnswer = async () => {
			throw new TypeError('Failed to fetch');
		};
		expect(await session.getAccessToken()).toBe('');
		expect(store.get(REFRESH_KEY)).toBe('rt-1');

		// a server error (not an auth error) keeps it as well
		apiAnswer = async () => ({ status: 500, body: { errors: [{ message: 'Something went wrong!' }] } });
		expect(await session.getAccessToken()).toBe('');
		expect(store.get(REFRESH_KEY)).toBe('rt-1');
	});
});

describe('session: logout', () => {
	it('clears this browser at once and tells the server with the refresh token', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(900), refreshToken: 'rt-1' });
		await session.endSession();
		expect(session.hasSession()).toBe(false);
		expect(session.peekAccessToken()).toBe('');
		expect(apiCalls[0].query).toContain('logout');
		expect(apiCalls[0].variables).toEqual({ refreshToken: 'rt-1' });
	});

	it('is logged out here even when the server cannot be reached', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(900), refreshToken: 'rt-1' });
		apiAnswer = async () => {
			throw new TypeError('Failed to fetch');
		};
		await expect(session.endSession()).resolves.toBeUndefined();
		expect(session.hasSession()).toBe(false);
	});
});

describe('session: other tabs', () => {
	it('a logout in another tab logs this tab out', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(900), refreshToken: 'rt-1' });
		store.delete(REFRESH_KEY); // the browser already removed it; then it tells the other tabs
		storageListeners.forEach((listener) => listener({ key: REFRESH_KEY, newValue: null }));
		expect(session.peekAccessToken()).toBe('');
	});

	it('a login in another tab logs this (guest) tab in with a refresh', async () => {
		const session = await load();
		const fresh = accessTokenFor(900);
		answerRefresh({ accessToken: fresh, refreshToken: 'rt-2' });
		store.set(REFRESH_KEY, 'rt-1');
		storageListeners.forEach((listener) => listener({ key: REFRESH_KEY, newValue: 'rt-1' }));
		await vi.waitFor(() => expect(session.peekAccessToken()).toBe(fresh));
	});

	it('ignores other storage keys', async () => {
		const session = await load();
		session.startSession({ accessToken: accessTokenFor(900), refreshToken: 'rt-1' });
		storageListeners.forEach((listener) => listener({ key: 'locale', newValue: null }));
		expect(session.peekAccessToken()).not.toBe('');
	});
});

describe('session: this browser as a device', () => {
	it('makes a device id once and keeps it', async () => {
		const session = await load();
		const first = session.getDevice();
		expect(first.deviceId.length).toBeGreaterThanOrEqual(8);
		expect(first.devicePlatform).toBe('WEB');
		expect(first.deviceName).toBe('Chrome on Windows');
		expect(session.getDevice().deviceId).toBe(first.deviceId);
		expect(store.get('carzip.deviceId')).toBe(first.deviceId);
	});

	it('names common browsers', async () => {
		const { browserName } = await load();
		expect(browserName('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Safari/604.1')).toBe('Safari on iOS');
		expect(browserName('Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0')).toBe('Firefox on Linux');
		expect(browserName('Mozilla/5.0 (Windows NT 10.0) Chrome/130.0 Safari/537.36 Edg/130.0')).toBe('Edge on Windows');
		expect(browserName('')).toBe('Browser');
	});
});
