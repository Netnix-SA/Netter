<script lang="ts">
    import type { PageData } from "./$types";
    import type { Snippet } from "svelte";

    import { client, createProductMutation } from "@/state";
    import { toast } from "svelte-sonner";
    import { goto, invalidate } from "$app/navigation";
    import { blur } from "svelte/transition";

	let { data, children }: { data: PageData, children: Snippet<[]> } = $props();
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name} {'/'} Features
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={async () => await createProductFeatureMutation({})()}>
		+
	</button>
</header>
<main class="flex-1 flex size-full">
	<div id="features" class="w-72 flex flex-col gap-2 border-r">
		<ul class="">
			{#each data.features as feature(feature.id)}
			<li class="gallery px-4 h-10 border-b" transition:blur>
				<a href={`/features/${feature.id}`} class="text-sm tactile-text flex-1">
					{feature.name}
				</a>
				<span class="text-muted-foreground/50 text-xs">
					{feature.value}
				</span>
			</li>
			{/each}
		</ul>
	</div>
	<div id="chat" class="flex items-center justify-center flex-1">
		{@render children()}
	</div>
</main>