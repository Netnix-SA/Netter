<script lang="ts">
    import type { PageData } from "./$types";
    import type { Snippet } from "svelte";

	import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
    import { client } from "@/state";
    import { toast } from "svelte-sonner";
    import { goto, invalidate } from "$app/navigation";
    import { blur } from "svelte/transition";

	let { data, children }: { data: PageData, children: Snippet<[]> } = $props();

	const queryClient = useQueryClient();

	const featuresGet = createQuery(() => ({
		queryKey: ['product', data.product.id, 'features'],
		queryFn: async () => {
			const response = await client.api.products({ id: data.product.id }).features.get();
			if (response.data) {
				return response.data;
			} else {
				throw new Error("Failed to fetch features");
			}
		},
	}));

	const productCreate = createMutation(() => ({
		mutationFn: async () => {
			const response = await client.api.products({ id: data.product.id }).features.post({ name: "New Feature", description: "Feature description", value: "Low", constraints: "", notes: "", });
			if (response.data) {
				return response.data;
			} else {
				throw new Error("Failed to create feature");
			}
		},
		onSuccess: (response) => {
			queryClient.invalidateQueries({ queryKey: ['product', data.product.id, 'features'] });
			invalidate("features:get");
			toast.success("Created feature", {
				action: {
					label: "Open",
					onClick: () => goto(`/features/${response.id}`),
				},
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	}));
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name} {'/'} Features
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={() => productCreate.mutate()}>
		+
	</button>
</header>
<main class="flex-1 flex size-full">
	<div id="features" class="w-72 flex flex-col gap-2 border-r">
		<ul class="">
			{#each data.features as feature(feature.id)}
			<li class="gallery px-4 h-10 border-b" transition:blur>
				<a href={`/features/${feature.id}`} class="text-sm tactile-text">
					{feature.name}
				</a>
			</li>
			{/each}
		</ul>
	</div>
	<div id="chat" class="flex items-center justify-center flex-1">
		{@render children()}
	</div>
</main>