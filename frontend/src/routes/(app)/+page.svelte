<script lang="ts">
    import UserAvatar from "@/components/UserAvatar.svelte";
	import * as ContextMenu from "$lib/components/ui/context-menu";

    import type { PageData } from "./$types";
    import TaskLine from "@/components/TaskLine.svelte";
    import ToDoLine from "@/components/ToDoLine.svelte";
    import MessageBody from "@/components/MessageBody.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Netter</title>
</svelte:head>

<div class="w-full h-full grid grid-cols-6 grid-rows-6">
	<div id="tasks" class="flex flex-col col-span-4 row-span-3 divide-y border-r border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				My tasks
			</span>
		</div>
		<div>
			{#await data.tasks}
				Loading tasks...
			{:then tasks}
				{#each tasks as task}
					<li class="gallery border-b h-10">
						<TaskLine labels={data.labels} {task} user={data.users.find(u => u.id === task.assignee?.id)}/>
					</li>
				{/each}
			{/await}
		</div>
	</div>
	<div id="todo" class="flex flex-col col-span-2 row-span-3 divide-y border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				ToDo's
			</span>
		</div>
		<ul>
			{#await data.todos}
				Loading todos...
			{:then todos}
				{#each todos as todo}
					<li class="border-b h-10">
						<ToDoLine {todo}/>
					</li>
				{/each}
			{/await}
		</ul>
	</div>
	<div id="merge-requests" class="flex flex-col col-span-2 row-span-3 divide-y border-r">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				Merge Requests
			</span>
		</div>
		<div>
		</div>
	</div>
	<div id="tasks" class="flex flex-col col-span-2 row-span-3 divide-y border-r">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				Pending inquiries
			</span>
		</div>
		<div class="flex-1">
			{#await data.messages}
				Loading pending...
			{:then messages}
				{#each messages as message}
					<li class="border-b h-10 gallery">
						<div class="gallery">
							<a href={`/messages/${message.id}`} class="ml-4">
								<MessageBody body={message.body}/>
							</a>
						</div>
					</li>
				{:else}
					<div class="frame size-full">
						<span class="text-sm italic text-muted-foreground">
							No pending inquiries! 🎉
						</span>
					</div>
				{/each}
			{/await}
		</div>
	</div>
	<div id="tasks" class="flex flex-col col-span-2 row-span-3 divide-y">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				Pending mentions
			</span>
		</div>
		<div class="flex-1">
			{#await data.pending_mentions}
				Loading pending...
			{:then messages}
				{#each messages as message}
					<li class="border-b h-10 gallery">
						<div class="gallery">
							<a href={`/messages/${message.id}`} class="ml-4">
								<MessageBody body={message.body}/>
							</a>
						</div>
					</li>
				{:else}
					<div class="frame size-full">
						<span class="text-sm italic text-muted-foreground">
							No pending mentions! 🎉
						</span>
					</div>
				{/each}
			{/await}
		</div>
	</div>
</div>
