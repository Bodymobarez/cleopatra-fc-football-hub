import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			// Don't retry 4xx client errors (auth failures, not-found, etc.)
			retry: (failureCount, error) => {
				const status = error?.status ?? error?.response?.status;
				if (status >= 400 && status < 500) return false;
				return failureCount < 1;
			},
		},
	},
});