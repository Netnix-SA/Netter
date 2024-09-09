<script lang="ts">
    import type { PageData } from "./$types";

	import * as ContextMenu from "$lib/components/ui/context-menu";

	import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";

    import { addPinned } from "@/actions";
    import { client } from "@/state";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import { blur } from "svelte/transition";
    import Separator from "@/components/ui/separator/separator.svelte";

    let { data }: { data: PageData } = $props();

	const queryClient = useQueryClient();

	const productsGet = createQuery(() => ({
		queryKey: ['products'],
		queryFn: async () => {
			const response = await client.api.products.get();
			if (response.data) {
				return response.data;
			} else {
				throw new Error("Failed to fetch products");
			}
		},
	}));

	const productCreate = createMutation(() => ({
		mutationFn: async () => {
			const response = await client.api.products.post({ name: "New Product", description: "Product description", });
			if (response.data) {
				return response.data;
			} else {
				throw new Error("Failed to create product");
			}
		},
		onSuccess: (response) => {
			if (response.id) {
				queryClient.invalidateQueries({ queryKey: ['products'] });
				toast.success("Created product", {
					action: {
						label: "Open",
						onClick: () => goto(`/products/${response.id}`),
					},
				});
			}
		},
		onError: (error) => {
			toast.error(error.message);
		},
	}));

	const productDelete = createMutation(() => ({
		mutationFn: async ({ id }: { id: string }) => {
			const response = await client.api.products({ id }).delete();
			if (response.error) {
				throw new Error("Failed to delete product");
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['products'] });
			toast.success("Deleted product");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	}));
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10 shrink-0">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My products
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={() => productCreate.mutate()}>
		+
	</button>
</header>
<main class="size-full flex-1 flex flex-col">
	{#if productsGet.isLoading}
	<div class="frame size-full">
		<span class="text-sm animate-pulse italic text-muted-foreground/50">
			Loading products...
		</span>
	</div>
	{:else if productsGet.isError}
	{productsGet.error.message}
	{:else if productsGet.isSuccess}
	<ul class="">
		{#each productsGet.data as product(product.id)}
			<li class="px-6 py-2 flex items-center border-b h-10 group" transition:blur>
				<ContextMenu.Root>
					<ContextMenu.Trigger class="flex-1 gallery gap-4">
						<a href={`/products/${product.id}`} class="">
							<span class="text-xs font-medium tactile-text">
								{product.name}
							</span>
						</a>
						<div class="gallery gap-2 opacity-0 group-hover:opacity-100 transition-all">
							<a href={`/products/${product.id}/features`} class="flex-1 item-background text-xs px-2 h-6 rounded frame">
								Features
							</a>
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item onclick={async () => await addPinned(product.id)}>Pin '{product.name}' product</ContextMenu.Item>
						<ContextMenu.Separator/>
						<ContextMenu.Item class="text-red-500" onclick={() => productDelete.mutate({ id: product.id })}>Delete</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</li>
		{/each}
	</ul>
	{/if}
</main>