<script lang="ts">
    import type { PageData } from "./$types";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { addPinned } from "@/actions";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My products
	</header>
	<main>
		<ul class="divide-y">
			{#each data.products as product}
				<li class="px-6 py-2 flex items-center last:border-b tactile-dark">
					<ContextMenu.Root>
						<ContextMenu.Trigger class="flex-1">
							<a href={`/products/${product.id}`} class="flex-1">
								<span class="text-xs font-medium tactile-text">
									{product.name}
								</span>
							</a>
						</ContextMenu.Trigger>
						<ContextMenu.Content>
							<ContextMenu.Item onclick={async () => await addPinned(product.id)}>Pin '{product.name}' product</ContextMenu.Item>
						</ContextMenu.Content>
					</ContextMenu.Root>
				</li>
			{/each}
		</ul>
	</main>
</div>