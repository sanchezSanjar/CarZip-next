import { useMemo } from 'react';
import { ApolloClient, ApolloLink, CombinedGraphQLErrors, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { from, switchMap } from 'rxjs';
import { getAccessToken, refreshAccessToken } from '../libs/auth/session';
import { GRAPHQL_URL } from '../libs/config';

let apolloClient: ApolloClient | undefined;

function createIsomorphicLink() {
	const httpLink = new HttpLink({ uri: GRAPHQL_URL });

	// every request: the access token when logged in, refreshed first when it is about to expire (browser only)
	const authLink = new SetContextLink(async (prevContext) => {
		const token = typeof window === 'undefined' ? '' : await getAccessToken();
		return { headers: { ...prevContext.headers, ...(token && { Authorization: `Bearer ${token}` }) } };
	});

	// the server refused a token that was still valid by time (the password was changed on another device, an admin
	// changed the role): refresh once and send the request again. A refused refresh ends the session (session.ts),
	// so the retry then runs as a guest and the page shows the guest view
	const retryLink = new ErrorLink(({ error, operation, forward }) => {
		if (CombinedGraphQLErrors.is(error)) {
			error.errors.forEach(({ message, path }) => console.log(`[GraphQL error]: ${message}, path: ${path}`));
			const unauthenticated = error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
			const { headers, retried } = operation.getContext();
			if (!unauthenticated || retried || !headers?.Authorization) return;
			operation.setContext({ retried: true });
			return from(refreshAccessToken()).pipe(switchMap(() => forward(operation)));
		}
		console.log(`[Network error]: ${error}`);
	});

	return ApolloLink.from([retryLink, authLink, httpLink]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState: NormalizedCacheObject | null = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: NormalizedCacheObject | null) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
