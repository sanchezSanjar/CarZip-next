import { useMemo } from 'react';
import { ApolloClient, ApolloLink, CombinedGraphQLErrors, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { getJwtToken, logOut } from '../libs/auth';
import { GRAPHQL_URL } from '../libs/config';

let apolloClient: ApolloClient | undefined;

function getHeaders(): Record<string, string> {
	const token = getJwtToken();
	return token ? { Authorization: `Bearer ${token}` } : {};
}

function createIsomorphicLink() {
	const httpLink = new HttpLink({ uri: GRAPHQL_URL });

	// the token only exists in the browser (localStorage)
	const authLink = new SetContextLink((prevContext) => ({
		headers: { ...prevContext.headers, ...getHeaders() },
	}));

	const errorLink = new ErrorLink(({ error, operation }) => {
		if (CombinedGraphQLErrors.is(error)) {
			error.errors.forEach(({ message, path }) => console.log(`[GraphQL error]: ${message}, path: ${path}`));
			// expired token, password changed or member blocked: continue as a guest
			const unauthenticated = error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');
			if (unauthenticated && getJwtToken() && operation.operationName !== 'Login') logOut();
		} else {
			console.log(`[Network error]: ${error}`);
		}
	});

	return ApolloLink.from([errorLink, authLink, httpLink]);
}

function createApolloClient() {
	return new ApolloClient({
		ssrMode: typeof window === 'undefined',
		link: createIsomorphicLink(),
		cache: new InMemoryCache(),
	});
}

export function initializeApollo(initialState: any = null) {
	const _apolloClient = apolloClient ?? createApolloClient();
	if (initialState) _apolloClient.cache.restore(initialState);
	if (typeof window === 'undefined') return _apolloClient;
	if (!apolloClient) apolloClient = _apolloClient;

	return _apolloClient;
}

export function useApollo(initialState: any) {
	return useMemo(() => initializeApollo(initialState), [initialState]);
}
