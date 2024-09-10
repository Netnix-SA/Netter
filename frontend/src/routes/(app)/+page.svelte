<script lang="ts">
    import type { PageData } from "./$types";
    import TaskLine from "@/components/TaskLine.svelte";
    import ToDoLine from "@/components/ToDoLine.svelte";
    import MessageBody from "@/components/MessageBody.svelte";

	let { data }: { data: PageData } = $props();

    import { client } from "@/state";
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
		<ul class="flex-1">
			{#await data.tasks}
				Loading tasks...
			{:then tasks}
				{#each tasks as task}
					<li class="gallery border-b h-10">
						<TaskLine labels={data.labels} {task} user={data.users.find(u => u.id === task.assignee?.id)}/>
					</li>
				{:else}
					<div class="frame size-full">
						<span class="text-sm italic text-muted-foreground/50">
							No tasks yet
						</span>
					</div>
				{/each}
			{/await}
		</ul>
	</div>
	<div id="todo" class="flex flex-col col-span-2 row-span-3 divide-y border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				ToDo's
			</span>
		</div>
		<ul class="flex-1">
			{#each data.todos as todo}
				<li class="border-b h-10">
					<ToDoLine {todo}/>
				</li>
			{:else}
				<div class="frame size-full">
					<span class="text-sm italic text-muted-foreground/50">
						No ToDos yet
					</span>
				</div>
			{/each}
		</ul>
	</div>
	<div id="merge-requests" class="flex flex-col col-span-2 row-span-3 divide-y border-r">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				Merge Requests
			</span>
		</div>
		<ul class="flex-1">
			<div class="frame size-full">
				<span class="text-sm italic text-muted-foreground/50">
					No merge requests yet
				</span>
			</div>
		</ul>
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
						<span class="text-sm italic text-muted-foreground/50">
							No pending inquiries
						</span>
					</div>
				{/each}
			{/await}
		</div>
	</div>
	<div id="tasks" class="flex flex-col col-span-2 row-span-3 divide-y">
		<div class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground">
			<span class=" tactile-text">
				Unresolved mentions
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
						<span class="text-sm italic text-muted-foreground/50">
							No unresolved mentions
						</span>
					</div>
				{/each}
			{/await}
		</div>
	</div>
</div>
