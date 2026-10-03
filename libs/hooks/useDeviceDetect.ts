import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 768px)';

const subscribe = (onChange: () => void) => {
	const media = window.matchMedia(QUERY);
	media.addEventListener('change', onChange);
	return () => media.removeEventListener('change', onChange);
};

/**
 * 'mobile' on narrow screens, 'desktop' otherwise. Uses the screen width (not the browser name),
 * so a narrow desktop window gets the phone layout too, and it updates when the window is resized.
 */
const useDeviceDetect = (): 'mobile' | 'desktop' =>
	useSyncExternalStore(
		subscribe,
		() => (window.matchMedia(QUERY).matches ? 'mobile' : 'desktop'),
		() => 'desktop', // the server can't know the screen
	);

export default useDeviceDetect;
