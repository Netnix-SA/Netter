<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { client } from "@/state";

	import { Confetti } from "svelte-confetti";

	let { todo }: { todo: { id: string, title: string, done: boolean } } = $props();
</script>

{#if todo.done}
{#key todo.done}
<Confetti/>
{/key}
{/if}

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex-1 px-4 py-2 gallery">
	<div id="left" class="gallery flex-1 gap-2">
		<input type="checkbox" class="" bind:checked={todo.done}/>
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
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item class="text-red-400" onclick={async () => { await client.api.todos({ id: todo.id }).delete(); }}>Delete</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>