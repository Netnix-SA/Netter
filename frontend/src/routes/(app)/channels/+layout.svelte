<script lang="ts">
    import type { LayoutData } from "./$types";
    import type { Snippet } from "svelte";
    import { flip } from "svelte/animate";
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { blur, crossfade, fly, scale, slide } from "svelte/transition";
    import { page } from "$app/stores";
    import { addPinned } from "@/actions";

	let { data, children }: { data: LayoutData, children: Snippet<[]> } = $props();
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My channels
	</header>
	<main class="flex-1 flex">
		<div id="channels" class="w-72 flex flex-col gap-2 border-r">
			<ul class="">
				{#each data.channels as channel(channel.id)}
				<li class="gallery px-4 h-10 border-b" animate:flip in:blur>
					<ContextMenu.Root>
						<ContextMenu.Trigger class="flex-1 px-2 py-2 gallery">
							<a href={`/channels/${channel.id}`} class="text-sm tactile-text">
								{channel.name}
							</a>
						</ContextMenu.Trigger>
						<ContextMenu.Content>
							<ContextMenu.Item onclick={async () => await addPinned(channel.id)}>Pin channel</ContextMenu.Item>
						</ContextMenu.Content>
					</ContextMenu.Root>
				</li>
				{/each}
			</ul>
		</div>
		<div id="chat" class="flex items-center justify-center flex-1">
			{@render children()}
		</div>
	</main>
</div>