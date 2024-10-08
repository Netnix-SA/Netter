<script lang="ts">
    import { ChevronDown, Plus } from "lucide-svelte";

    import TaskLine from "./TaskLine.svelte";
    import type { Efforts, Priorities, Value, Status } from "@/types";
    import { STATES } from "@/utils.ts";

	type Task = {
		id: string,
		progress: number,
		title: string, body: string,
		status: { id: string, },
		priority: Priorities, effort: Efforts, value: Value,
		assignee: { id: string } | null,
		labels: { id: string }[],
		related: { id: string }[],
	};

	let { groups, statuses, labels, users, draft_task = $bindable() }: { groups: [Status, Task[]][], statuses: any[], labels: any[], users: any[], draft_task?: Omit<Task, "id"> | null } = $props();
</script>

{#each groups as [status, tasks]}
{@const state_entry = STATES.find(s => s.value === status.state)}
{@const Icon = state_entry?.icon}
	<details open={status.state !== "Resolved"}>
		<summary class="bg-primary-foreground flex items-center pl-4 py-2 border-y mt-2 cursor-pointer group-[summary]">
			<div class="flex items-center gap-2 flex-1">
				<div class="gallery gap-4 tactile-text min-w-32">
					<Icon class="size-4"/>
					{status?.name}
				</div>
				<div>

				</div>
			</div>
			<div class="w-12 frame">
				{#if draft_task !== undefined}
					<button class="rounded-md bg-primary-foreground border size-6 frame" onclick={() => draft_task = { status, }}>
						<Plus class="size-4"/>
					</button>
				{/if}
				<!-- <ChevronDown class="size-4 group-[summary]-open:rotate-180"/> -->
			</div>
		</summary>
		{#each tasks as task}
			<TaskLine {labels} {task} user={users.find(u => u.id === task.assignee?.id)}/>
		{:else}
			<div class="frame size-full border-b">
				<span class="text-sm italic text-muted-foreground/50">
					No tasks
				</span>
			</div>
		{/each}
	</details>
{:else}
	<div class="frame size-full">
		<span class="text-sm italic text-muted-foreground/50">
			No tasks
		</span>
	</div>
{/each}