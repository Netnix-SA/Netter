<script lang="ts">
	import { CLASS_TO_ICON } from "@/global";
	import { MessageCircleQuestion } from "lucide-svelte";

	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { removePinned } from "@/actions";
    import { goto } from "$app/navigation";
    import { client } from "@/state";

	let { id }: { id: string } = $props();

	function buildUrl(clss: string, id: string) {
		if (clss === "Project") {
			return `/projects/${id}`;
		}

		if (clss === "User") {
			return `/users/${id}`;
		}

		if (clss === "Team") {
			return `/teams/${id}`;
		}

		if (clss === "Task") {
			return `/tasks/${id}`;
		}

		if (clss === "Repository") {
			return `/repositories/${id}`;
		}

		if (clss === "Channel") {
			return `/channels/${id}`;
		}

		if (clss === "View") {
			return `/views/${id}`;
		}

		if (clss === "Product") {
			return `/products/${id}`;
		}

		if (clss === "Feature") {
			return `/features/${id}`;
		}

		if (clss === "Application") {
			return `/applications/${id}`;
		}

		if (clss === "Bug") {
			return `/bugs/${id}`;
		}

		if (clss === "Objective") {
			return `/objectives/${id}`;
		}

		return "/";
	}

	let metadata = $state(client.api.metadata({ id }).get());

	let clss = $derived(id.split(':')[0] as "Project" | "User" | "Team" | "Task" | "Product" | "Objective" | undefined);
	let name = $state(id.split(':')[1]);
	let link = $derived(clss !== undefined ? buildUrl(clss, id) : "/");
</script>

<div class="gallery gap-2 h-10 rounded-md border px-2">
	<ContextMenu.Root>
		<ContextMenu.Trigger class="flex-1 gap-2 py-2 gallery">
			<svelte:component this={clss !== undefined ? CLASS_TO_ICON[clss] : MessageCircleQuestion} class="size-4"/>
			{#await metadata}
				<div class="w-16 h-2 animate-pulse">
				</div>
			{:then mtdt}
				<a href={link} class="tactile-text text-sm">{mtdt.data?.title}</a>
			{/await}
		</ContextMenu.Trigger>
		<ContextMenu.Content>
			<ContextMenu.Item onclick={async () => await removePinned(id)}>Unpin '{name}'</ContextMenu.Item>
			{#if clss === "Project"}
				<ContextMenu.Separator/>
				<ContextMenu.Label>Project</ContextMenu.Label>
				<ContextMenu.Separator/>
				<ContextMenu.Item onclick={async () => await goto(`/projects/${id}/tasks`)}>Tasks</ContextMenu.Item>
			{/if}
			{#if clss === "Objective"}
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