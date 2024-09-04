<script lang="ts">
    import type { PageData } from "./$types";
    import type { Snippet } from "svelte";

	let { data, children }: { data: PageData, children: Snippet<[]> } = $props();
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My features
		</h1>
	</div>
</header>
<div class="flex-1 flex flex-col w-full divide-y">
	<main class="flex-1 flex">
		<div id="features" class="w-72 flex flex-col gap-2 border-r">
			<ul class="">
				{#each data.features as feature(feature.id)}
				<li class="gallery px-4 h-10 border-b">
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
</div>