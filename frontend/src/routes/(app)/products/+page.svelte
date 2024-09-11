<script lang="ts">
    import type { PageData } from "./$types";

	import * as ContextMenu from "$lib/components/ui/context-menu";

    import { blur } from "svelte/transition";
    import { createProductMutation } from "@/state";

    let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Products</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10 shrink-0">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			Products
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={() => createProductMutation({})()}>
		+
	</button>
</header>
<main class="size-full flex-1 flex flex-col">
	<ul class="">
		{#each data.products as product(product.id)}
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
						{#each CLASSES["Product"].actions as { label, icon: Icon, action }}
							{#if label === "Delete"}
								<ContextMenu.Separator/>
							{/if}
							<ContextMenu.Item onclick={async () => await action({}, product.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
								<Icon class="size-4 mr-2"/> {label}
							</ContextMenu.Item>
						{/each}
					</ContextMenu.Content>
				</ContextMenu.Root>
			</li>
		{/each}
	</ul>
</main>