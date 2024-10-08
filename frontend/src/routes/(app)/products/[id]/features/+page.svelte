<script lang="ts">
    import type { PageData } from "./$types";
    import type { Snippet } from "svelte";

	import * as ContextMenu from "$lib/components/ui/context-menu";

    import { client, createProductFeatureMutation, } from "@/state";
    import { blur } from "svelte/transition";
    import { CLASSES } from "@/utils.ts";

	let { data }: { data: PageData } = $props();
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name} {'/'} Features
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={async () => await createProductFeatureMutation({})({ id: data.product.id })}>
		+
	</button>
</header>
<main class="flex-1 flex size-full">
	<ul class="size-full">
		{#each data.features as feature(feature.id)}
		<li class="gallery px-4 h-10 border-b" transition:blur>
			<ContextMenu.Root>
				<ContextMenu.Trigger class="size-full gallery">
				<a href={`/features/${feature.id}`} class="text-sm tactile-text flex-1">
					{feature.name}
				</a>
				<span class="text-muted-foreground/50 text-xs">
					{feature.value}
				</span>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
				{#each CLASSES['Feature'].actions as { label, icon: Icon, action }}
					{#if label === "Delete"}
						<ContextMenu.Separator/>
					{/if}
					<ContextMenu.Item onclick={() => action({}, feature.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
						<Icon class="size-4 mr-2"/> {label}
					</ContextMenu.Item>
				{/each}
				</ContextMenu.Content>
			</ContextMenu.Root>
		</li>
		{:else}
			<div class="size-full frame flex-col">
				<span class="text-muted-foreground/50 text-sm italic">No features.</span>
				<span class="text-muted-foreground/50 text-sm italic">Create one from the upper right plus sign.</span>
			</div>
		{/each}
	</ul>
</main>