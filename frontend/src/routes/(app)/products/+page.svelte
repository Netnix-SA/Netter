<script lang="ts">
    import type { PageData } from "./$types";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { addPinned } from "@/actions";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My products
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<!-- <Pin pinned={data.user.pinned} id={data.objective.id}/> -->
</header>
<div class="flex-1 flex flex-col w-full divide-y">
	<main>
		<ul class="divide-y">
			{#each data.products as product}
				<li class="px-6 py-2 flex items-center last:border-b h-10">
					<ContextMenu.Root>
						<ContextMenu.Trigger class="flex-1 gallery gap-4">
							<a href={`/products/${product.id}`} class="">
								<span class="text-xs font-medium tactile-text">
									{product.name}
								</span>
							</a>
							<div class="gallery gap-2">
								<a href={`/products/${product.id}/features`} class="flex-1 item-background text-xs px-2 h-6 rounded frame">
									Features
								</a>
							</div>
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
