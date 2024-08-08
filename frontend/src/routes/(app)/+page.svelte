<script lang="ts">
    import UserAvatar from "@/components/UserAvatar.svelte";
	import * as ContextMenu from "$lib/components/ui/context-menu";

    import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full h-full grid grid-cols-6 grid-rows-6">
	<div id="tasks" class="flex flex-col col-span-4 row-span-3 divide-y border-r border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm" style="background:linear-gradient(to right, #101010 0%, rgb(10, 10, 10) 80%);">
			My tasks
		</div>
		<div>
			{#await data.tasks}
				Loading tasks...
			{:then tasks}
				{#each tasks as task}
					<div class="flex px-4 py-2 gap-3">
						<div id="left-col" class="flex flex-col w-8 pt-2">
							<!-- <UserAvatar full_name={task.assignee}/> -->
						</div>
						<div id="right-side" class="flex-1">
							<span class="text-sm font-semibold">
								{task.name}
							</span>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									<span class="text-sm">
										{task.name}
									</span>
								</ContextMenu.Trigger>
								<ContextMenu.Content>
									<ContextMenu.Item>Profile</ContextMenu.Item>
									<ContextMenu.Item>Billing</ContextMenu.Item>
									<ContextMenu.Item>Team</ContextMenu.Item>
									<ContextMenu.Item>Subscription</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</div>
					</div>
				{/each}
			{/await}
		</div>
	</div>
	<div id="todo" class="flex flex-col col-span-2 row-span-3 divide-y border-b">
		<div class="flex w-full px-6 h-10 items-center text-sm" style="background:linear-gradient(to right, #101010 0%, rgb(10, 10, 10) 80%);">
			ToDo's
		</div>
		<div>
		</div>
	</div>
	<div id="merge-requests" class="flex flex-col col-span-2 row-span-3 divide-y border-r" style="background:linear-gradient(to right, #101010 0%, rgb(10, 10, 10) 80%);">
		<div class="flex w-full px-6 h-10 items-center text-sm">
			Merge Requests
		</div>
		<div>
		</div>
	</div>
	<div id="tasks" class="flex flex-col col-span-4 row-span-3 divide-y" style="background:linear-gradient(to right, #101010 0%, rgb(10, 10, 10) 80%);">
		<div class="flex w-full px-6 h-10 items-center text-sm">
			My tasks
		</div>
		<div>
		</div>
	</div>
</div>