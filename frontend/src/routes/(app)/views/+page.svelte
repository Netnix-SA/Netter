<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<header class="h-10 border-b w-full gallery px-4 bg-primary-foreground">
	<span class="text-sm tactile-text">
		Views
	</span>
</header>
<main class="flex-1 column w-full">
	<ul class="flex-1 w-full">
		{#each data.views as view}
        <li class="gallery px-4 h-10 border-b w-full gap-2">
			<div id="left" class="gallery flex-1 gap-2">
                <a href={`/views/${view.id}`} class="text-xs tactile-text">
					{view.name}
				</a>
            </div>
        </li>
        {/each}
    </ul>
</main>