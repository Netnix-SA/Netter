<script lang="ts">
	import { CLASSES, cn, color_to_class } from "@/utils";
	import { MessageCircleQuestion } from "lucide-svelte";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { removePinned, addPinned } from "@/actions";
    import { client } from "@/state";
    import type { Classes } from "@/types";
    import type { Component } from "svelte";

	let { id, pinned = [], context }: { id: string, pinned: string[], context?: { name: string, actions: { label: string, icon: Component, action: any }[] } } = $props();

	function buildUrl(clss: Classes, id: string) {
		switch (clss) {
			case "Project": return `/projects/${id}`;
			case "User": return `/users/${id}`;
			case "Team": return `/teams/${id}`;
			case "Task": return `/tasks/${id}`;
			case "Repository": return `/repositories/${id}`;
			case "Channel": return `/channels/${id}`;
			case "View": return `/views/${id}`;
			case "Product": return `/products/${id}`;
			case "Feature": return `/features/${id}`;
			case "Application": return `/applications/${id}`;
			case "Bug": return `/bugs/${id}`;
			case "Objective": return `/objectives/${id}`;
			case "Component": return `/component/${id}`;
			default: return "/";
		}
	}

	let metadata = $state(client.api.metadata({ id }).get());

	let clss = $derived(id.split(':')[0] as Classes | undefined);
	let name = $state(id.split(':')[1]);
	let link = $derived(clss !== undefined ? buildUrl(clss, id) : "/");
</script>

<a class="gallery gap-2 h-10 rounded-md border px-2 bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-2xl transition-all" href={link}>
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex-1 gap-2 py-2 gallery">
			{@const Icon = clss !== undefined ? CLASSES[clss].icon : MessageCircleQuestion}
			<Icon class="size-4"/>
			{#await metadata}
				<div class="w-24 h-3 rounded animate-pulse bg-neutral-700">
				</div>
			{:then mtdt}
				<div class="gallery flex-1">
					<span class="tactile-text text-sm">{mtdt.data?.title}</span>
				</div>
				{#if clss == "Task"}
					{#await client.api.tasks({ id }).get()}
						<div class="w-8 h-3 rounded animate-pulse bg-neutral-700">
						</div>
					{:then { data }}
						{#await client.api.statuses({ id: data?.status.id }).get()}
							<div class="w-8 h-3 rounded animate-pulse bg-neutral-700">
							</div>
						{:then { data }}
							<span class="text-xs text-muted-foreground mr-2">
								{data?.name}
							</span>
						{/await}
					{/await}
				{/if}
			{/await}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			{#if context && context.actions.length > 0}
				<ContextMenu.Group>
					<ContextMenu.GroupHeading>
						{context.name}
					</ContextMenu.GroupHeading>
					<ContextMenu.Separator/>
					{#each context.actions as { label, icon: Icon, action }}
						{#if label === "Delete"}
							<ContextMenu.Separator/>
						{/if}
						<ContextMenu.Item onclick={() => action({}, id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
							<Icon class="size-4 mr-2"/> {label}
						</ContextMenu.Item>
					{/each}
					<ContextMenu.Separator/>
				</ContextMenu.Group>
			{/if}
			<ContextMenu.Group title={clss}>
				<ContextMenu.GroupHeading>
					{clss}
				</ContextMenu.GroupHeading>
				<ContextMenu.Separator/>
				{#each CLASSES[clss].actions as { label, icon: Icon, action }}
					{#if label === "Delete"}
						<ContextMenu.Separator/>
					{/if}
					<ContextMenu.Item onclick={() => action({}, id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
						<Icon class="size-4 mr-2"/> {label}
					</ContextMenu.Item>
				{/each}
			</ContextMenu.Group>
		</ContextMenu.Content>
	</ContextMenu.Root>
</a>
