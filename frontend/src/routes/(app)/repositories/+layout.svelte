<script lang="ts">
    import { ExternalLink } from "lucide-svelte";
	import type { LayoutData } from "./$types";
    import type { Snippet } from "svelte";

	let { data, children }: { data: LayoutData, children: Snippet<[]> } = $props();
</script>

<header class="h-10 border-b w-full gallery px-4 bg-primary-foreground">
	<span class="text-sm tactile-text">
		Repositories
	</span>
</header>
<main class="flex-1 flex w-full">
	<ul class="flex-1 w-full">
		{#each data.repositories as repository}
		<li class="gallery px-4 h-10 border-b w-full gap-2">
			<div id="left" class="gallery flex-1 gap-2">
				<a href={`/repositories/${repository.id}`} class="text-xs tactile-text">
					{repository.name}
				</a>
				<div class="gallery gap-2">
					{#if repository.url}
					<a href={repository.url} class="gallery gap-2 item-background h-6 px-2 rounded text-xs" target="_blank" rel="noopener noreferrer">
						{repository.provider}
						<ExternalLink class="size-4"/>
					</a>
					{/if}
					<a class="text-xs gallery item-background h-6 px-2 rounded" href={`/repositories/${repository.id}/merge-requests`}>
						Merge Requests
					</a>
				</div>
			</div>
			<div id="right" class="gallery">
			</div>
		</li>
		{/each}
	</ul>
	{@render children()}
</main>