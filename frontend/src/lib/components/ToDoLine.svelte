<script lang="ts">
    import { t } from "elysia";

	let { todo }: { todo: { id: string, title: string | null, url: string | null, done: boolean } } = $props();
</script>

<div class="flex-1 px-4 py-2 gallery">
	<div id="left" class="gallery flex-1 gap-2">
		<input type="checkbox" class="" bind:checked={todo.done}/>
		<a href={`/todos/${todo.id}`} class="flex items-center">
			<span class="text-sm tactile-text">
				{(todo.title || todo.url) || "BROKEN!"}
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