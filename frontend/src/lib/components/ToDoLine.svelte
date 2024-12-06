<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { CLASSES } from "@/utils.ts";
    import { client, updateToDoMutation } from "@/state";

    import { blur } from "svelte/transition";

	let { todo, }: { todo: { id: string, title: string, done: boolean } } = $props();
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger>
		<div class="gallery px-4 h-10 border-b" transition:blur>
			<input type="checkbox" class="size-4 mr-3" onchange={async () => await updateToDoMutation({})({ id: todo.id, done: true })} bind:checked={todo.done}/>
			<div id="left" class="gallery flex-1 gap-2">
				<a href={`/todos/${todo.id}`} class="flex items-center">
					<span class="text-sm tactile-text">
						{todo.title}
					</span>
				</a>
			</div>
			<div id="right" class="gallery gap-2">
				<!-- <div class="gallery">
					<UserAvatar full_name={data.users.find(u => u.id === task.assignee?.id)?.full_name}/>
				</div>
				<div class="gallery">
					{#each task.labels as { id }}
					{@const label = data.labels.find(l => l.id === id)}
						<Label {label}/>
					{/each}
				</div> -->
			</div>
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		{#each CLASSES["ToDo"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<ContextMenu.Separator/>
			{/if}
			<ContextMenu.Item onclick={async () => await action({}, todo.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</ContextMenu.Item>
		{/each}
	</ContextMenu.Content>
</ContextMenu.Root>