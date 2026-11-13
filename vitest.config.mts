import { defineConfig } from 'vitest/config';

// unit tests of the browser-free logic (the login session). `npm test`
export default defineConfig({
	test: {
		include: ['**/*.test.ts'],
		exclude: ['node_modules/**', '.next/**'],
		environment: 'node',
	},
});
