export class QueryClient {};

export function createMutation<ARGS extends any[], R, E>({ mutationFn, onSuccess, onError } : { mutationFn: (...args: ARGS) => Promise<R>, onSuccess: (data: R) => void; onError: (error: Error) => void; }) {
	return (queryClient: QueryClient) => {
		return async (...args: ARGS) => {
			try {
				const data = await mutationFn(...args);
				onSuccess(data);
			} catch (e) {
				onError(e);
			}
		};
	};
};