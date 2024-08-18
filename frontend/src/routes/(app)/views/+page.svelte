<script lang="ts">
	import type { PageData } from "./$types";

    import { addPinned } from "@/actions";
	
	import * as ContextMenu from "$lib/components/ui/context-menu";

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
			<ContextMenu.Root>
				<ContextMenu.Trigger class="flex-1 px-2 py-2 gallery">
					<a href={`/views/${view.id}`} class="text-xs tactile-text">
						{view.name}
					</a>
				</ContextMenu.Trigger>
				<ContextMenu.Content>
					<ContextMenu.Item onclick={async () => await addPinned(view.id)}>Pin '{view.name}' view</ContextMenu.Item>
				</ContextMenu.Content>
			</ContextMenu.Root>
		</li>
		{/each}
	</ul>
</main>