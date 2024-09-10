<script lang="ts">
	import { CLASS_TO_ICON, CLASSES } from "@/global";
	import { MessageCircleQuestion } from "lucide-svelte";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { removePinned, addPinned } from "@/actions";
    import { goto } from "$app/navigation";
    import { client } from "@/state";
    import type { Classes } from "@/types";
    import { task, todo } from "@/all.svelte.ts";
    import { toast } from "svelte-sonner";

	let { id, pinned = [] }: { id: string, pinned: string[] } = $props();

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

<div class="gallery gap-2 h-10 rounded-md border px-2 bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-2xl transition-all">
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex-1 gap-2 py-2 gallery">
			{@const Icon = clss !== undefined ? CLASS_TO_ICON[clss] : MessageCircleQuestion}
			<Icon class="size-4"/>
			{#await metadata}
				<div class="w-16 h-2 animate-pulse">
				</div>
			{:then mtdt}
				<a href={link} class="tactile-text text-sm">{mtdt.data?.title}</a>
			{/await}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			{#each CLASSES[clss].actions as { label, icon: Icon, action }}
				{#if label === "Delete"}
					<ContextMenu.Separator/>
				{/if}
				<ContextMenu.Item onclick={() => action({}, id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
					<Icon class="size-4 mr-2"/> {label}
				</ContextMenu.Item>
			{/each}
		</ContextMenu.Content>
	</ContextMenu.Root>
</div>
