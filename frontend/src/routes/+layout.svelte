<script lang="ts">
    import type { Snippet } from "svelte";
    import "../app.css";

	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';

    let { children }: { children: Snippet<[]> } = $props();

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 30,
			},
		},
	});
</script>

<svelte:head>
    <title>Netter</title>
</svelte:head>

<QueryClientProvider client={queryClient}>
{@render children()}
</QueryClientProvider>