<script lang="ts">
	import { CLASS_TO_ICON } from "@/global";
	import { MessageCircleQuestion } from "lucide-svelte";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { removePinned, addPinned } from "@/actions";
    import { goto } from "$app/navigation";
    import { client } from "@/state";
    import type { Classes } from "@/types";
    import { task, todo } from "@/all.svelte.ts";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
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

	const queryClient = useQueryClient();

	let pinCreate = createMutation(() => ({
		mutationFn: ({ id }: { id: string }) => {
			return client.api.users.me.pins.post({ id });
		},
		onSuccess: () => {
			toast.success("Pinned");
			queryClient.invalidateQueries({ queryKey: ['pins'] });
		},
	}));

	let pinDelete = createMutation(() => ({
		mutationFn: ({ id }: { id: string }) => {
			return client.api.users.me.pins({ id }).delete();
		},
		onSuccess: () => {
			toast.success("Unpinned");
			queryClient.invalidateQueries({ queryKey: ['pins'] });
		},
	}));
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
			{#if pinned.includes(id)}
				<ContextMenu.Item onclick={() => pinDelete.mutate({ id })}>Unpin '{name}'</ContextMenu.Item>
			{:else}
				<ContextMenu.Item onclick={() => pinCreate.mutate({ id })}>Pin '{name}'</ContextMenu.Item>
			{/if}
			<ContextMenu.Item onclick={() => todo.value = { title: "", related: { id, title: name ?? "" } }}>
				Add ToDo
			</ContextMenu.Item>
			{#if clss === "Feature"}
				<ContextMenu.Item onclick={async () => task.value = { related: [{ id }] }}>Create related task</ContextMenu.Item>
				<ContextMenu.Separator/>
				<ContextMenu.Label>Feature</ContextMenu.Label>
				<ContextMenu.Separator/>
			{/if}
			{#if clss === "Project"}
				<ContextMenu.Item onclick={() => { task.project = id; task.value = {}; }}>Create task</ContextMenu.Item>
				<ContextMenu.Separator/>
				<ContextMenu.Label>Project</ContextMenu.Label>
				<ContextMenu.Separator/>
				<ContextMenu.Item onclick={async () => await goto(`/projects/${id}/tasks`)}>Tasks</ContextMenu.Item>
				<ContextMenu.Item onclick={async () => await goto(`/projects/${id}/objectives/active`)}>Objective</ContextMenu.Item>
			{/if}
			{#if clss === "Component"}
				<ContextMenu.Item onclick={async () => task.value = { related: [{ id }] }}>Create related task</ContextMenu.Item>
				<!-- <ContextMenu.Separator/>
				<ContextMenu.Label>Objective</ContextMenu.Label>
				<ContextMenu.Separator/>
				<ContextMenu.Item onclick={async () => await goto(`/objectives/${id}/tasks`)}>Tasks</ContextMenu.Item> -->
			{/if}
			{#if clss === "Objective"}
				<ContextMenu.Item onclick={async () => task.value = { related: [{ id }] }}>Create related task</ContextMenu.Item>
				<ContextMenu.Separator/>
				<ContextMenu.Label>Objective</ContextMenu.Label>
				<ContextMenu.Separator/>
				<ContextMenu.Item onclick={async () => await goto(`/objectives/${id}/tasks`)}>Tasks</ContextMenu.Item>
			{/if}
			{#if clss === "Product"}
				<ContextMenu.Separator/>
				<ContextMenu.Label>Product</ContextMenu.Label>
				<ContextMenu.Separator/>
				<ContextMenu.Item onclick={async () => await goto(`/products/${id}/features`)}>Features</ContextMenu.Item>
			{/if}
		</ContextMenu.Content>
	</ContextMenu.Root>
</div>
