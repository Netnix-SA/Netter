<script lang="ts">
    import UserAvatar from "@/components/UserAvatar.svelte";
	import * as ContextMenu from "$lib/components/ui/context-menu";

    import type { PageData } from "./$types";
    import TaskLine from "@/components/TaskLine.svelte";
    import ToDoLine from "@/components/ToDoLine.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full h-full grid grid-cols-6 grid-rows-6">
	<div id="tasks" class="flex flex-col col-span-4 row-span-3 divide-y border-r border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm header-background">
			My tasks
		</div>
		<div>
			{#await data.tasks}
				Loading tasks...
			{:then tasks}
				{#each tasks as task}
					<li class="border-b h-10">
						<TaskLine {task} user={data.users.find(u => u.id === task.assignee?.id)}/>
					</li>
				{/each}
			{/await}
		</div>
	</div>
	<div id="todo" class="flex flex-col col-span-2 row-span-3 divide-y border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm header-background">
			ToDo's
		</div>
		<div>
			{#await data.todos}
				Loading todos...
			{:then todos}
				{#each todos as todo}
					<li class="border-b h-10">
						<ToDoLine {todo}/>
					</li>
				{/each}
			{/await}
		</div>
	</div>
	<div id="merge-requests" class="flex flex-col col-span-2 row-span-3 divide-y border-r">
		<div class="flex w-full px-6 h-10 items-center text-sm  header-background">
			Merge Requests
		</div>
		<div>
		</div>
	</div>
	<div id="tasks" class="flex flex-col col-span-4 row-span-3 divide-y">
		<div class="flex w-full px-6 h-10 items-center text-sm header-background">
			Pending
		</div>
		<div>
		</div>
	</div>
</div>