<script lang="ts">
    import { Plus } from "lucide-svelte";

    import TaskLine from "./TaskLine.svelte";
    import type { Efforts, Priorities, Value } from "@/types";
    import { STATES } from "@/global";

	type Task = { id: string, progress: number, title: string, body: string, status: { id: string, }, priority: Priorities, effort: Efforts, value: Value, assignee: { id: string } | null, labels: { id: string }[], };

	let { groups, statuses, labels, users }: { groups: [string, Task[]][], statuses: any[], labels: any[], users: any[] } = $props();
</script>

{#each groups as [grouper, tasks]}
{@const status = statuses.find(s => s.id === grouper)}
{@const state_entry = STATES.find(s => s.value === status?.state)}
	<details open={status.state !== "Resolved"}>
		<summary class="bg-primary-foreground flex items-center pl-4 py-2 border-y mt-2 cursor-pointer">
			<div class="flex items-center gap-4 tactile-text flex-1">
				<svelte:component this={state_entry?.icon} class="h-4 w-4"/>
				{status?.name}
			</div>
			<div class="w-12 frame">
				<!-- <button class="rounded-md bg-primary-foreground border size-6 frame" onclick={() => draft_task = { title: "My task", body: "", assignee: null, labels: [], effort: null, priority: null, status, value: null }}>
					<Plus class="size-4"/>
				</button> -->
			</div>
		</summary>
		{#each tasks as task}
			<li class="flex items-center border-b h-10 w-full">
				<TaskLine {labels} {task} user={users.find(u => u.id === task.assignee?.id)}/>
			</li>
		{/each}
	</details>
{/each}