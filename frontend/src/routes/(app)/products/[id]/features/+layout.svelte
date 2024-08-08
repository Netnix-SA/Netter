<script lang="ts">
    import type { LayoutData } from "./$types";
    import type { Snippet } from "svelte";
    import { flip } from "svelte/animate";
    import { blur, crossfade, fly, scale, slide } from "svelte/transition";
    import { page } from "$app/stores";

	let { data, children }: { data: LayoutData, children: Snippet<[]> } = $props();
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My features
	</header>
	<main class="flex-1 flex">
		<div id="features" class="w-72 flex flex-col gap-2 border-r">
			<ul class="p-2">
				{#each data.features as feature(feature.id)}
				<li class="gallery px-4 h-12 border rounded-lg shadow-xl header-background" animate:flip in:blur>
					<a href={`${$page.url}/${feature.id}`} class="text-sm tactile-text">
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
</div>