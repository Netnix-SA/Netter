<script lang="ts">
    import type { PageData } from "./$types";
    import type { Snippet } from "svelte";

	let { data, children }: { data: PageData, children: Snippet<[]> } = $props();
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My features
	</header>
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