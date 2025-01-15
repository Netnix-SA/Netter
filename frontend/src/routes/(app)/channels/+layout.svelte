<script lang="ts">
    import type { LayoutData } from "./$types";
    import type { Snippet } from "svelte";
    import { flip } from "svelte/animate";
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { blur, crossfade, fly, scale, slide } from "svelte/transition";
    import { page } from "$app/stores";
    import { addPinned } from "@/actions";
    import { getSvate } from "@facundo-villa/svate";
    import { client } from "@/state";
    import { invalidate } from "$app/navigation";
    import { Button } from "@/components/ui/button";

	let { data, children }: { data: LayoutData, children: Snippet<[]> } = $props();

	const svate = getSvate();

	const createChannel = svate.mutation(() => {
		const r = client.api.channels.post({
			name: "New channel",
		});

		return {
			invalidate: ["channels"],
		};
	});

	const channels = svate.query(async () => {
		const { data } = await client.api.channels.get();

		if (!data) {
			throw new Error("No data");
		}

		return {
			value: data,
			depends: [
				["channels"],
			],
		};
	});
</script>

<svelte:head>
	<title>Channels</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="flex-1">
		<h1 class="tactile-text text-sm">
			My channels
		</h1>
	</div>
	<Button class="size-8" onclick={createChannel}>
		New channel
	</Button>
</header>
<div class="flex-1 flex flex-col w-full">
	<main class="flex-1 flex">
		<div id="channels" class="w-72 flex flex-col gap-2 border-r">
			<ul class="size-full">
				{#await channels.value then channels}
					{#each channels as channel(channel.id)}
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
					{:else}
					<div class="frame size-full">
						<span class="text-sm italic text-muted-foreground/50">
							No channels yet
						</span>
					</div>
					{/each}
				{/await}
			</ul>
		</div>
		<div id="chat" class="flex items-center justify-center flex-1">
			{@render children()}
		</div>
	</main>
</div>