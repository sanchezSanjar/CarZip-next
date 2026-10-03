import { useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';

const noop = () => () => {};

/**
 * true once the page's address (?id=..., ?mode=...) can be read.
 * It is always false on the server and on the browser's first draw, so both draw the same thing
 * (otherwise React has to throw the server's HTML away: a "hydration mismatch").
 */
export const useAddressReady = (): boolean => {
	const router = useRouter();
	const hydrated = useSyncExternalStore(noop, () => true, () => false);
	return hydrated && router.isReady;
};
