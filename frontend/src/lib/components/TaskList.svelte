<script lang="ts">
    import { ChevronDown, Plus } from "lucide-svelte";

	import * as Table from "$lib/components/ui/table/index.js";

    import TaskLine from "./TaskLine.svelte";
    import type { Efforts, Priorities, Value, Status } from "@/types";
    import { STATES } from "@/utils.ts";
    import { goto } from "$app/navigation";
    import { client } from "@/state";

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

	let {
		tasks,
		statuses,
		labels,
		users,
		draft_task = $bindable(),
		onselect = () => {},
	}: { tasks: Task[], statuses: any[], labels: any[], users: any[], draft_task?: Omit<Task, "id"> | null, onselect: (id: string) => void } = $props();
</script>
	
<Table.Root>
	<Table.Caption>Tasks</Table.Caption>
	<Table.Header>
		<Table.Row class="leading-3">
			<Table.Head class="w-8">
				<input type="checkbox" class="size-4" onchange={(e) => tasks.forEach(task => onselect(task.id))}/>
			</Table.Head>
			<Table.Head class="w-full">Title</Table.Head>
			<Table.Head class="w-full">Labels</Table.Head>
			<Table.Head class="w-48">Status</Table.Head>
			<Table.Head class="w-48">Priority</Table.Head>
			<Table.Head class="w-48">Effort</Table.Head>
			<Table.Head class="w-48">Assignee</Table.Head>
			<Table.Head class="w-48">Value</Table.Head>
			<Table.Head class="w-8">
				<button class="rounded-md bg-primary-foreground border size-6 frame" onclick={() => draft_task = {}}>
					<Plus class="size-4"/>
				</button>
			</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each tasks as { id, title, status, effort, assignee, priority, value, labels }}
			<Table.Row class="leading-4">
				<Table.Cell role="checkbox">
					<input type="checkbox" class="size-4" onchange={(e) => onselect(id)}/>
				</Table.Cell>
				<Table.Cell class="font-medium" onclick={() => goto(`/tasks/${id}`)}>{title}</Table.Cell>
				<Table.Cell>
					{#each labels as { id }}
						{@const label = labels.find(l => l.id === id)}
						{#if label}
							{label.id}
						{/if}
					{/each}
				</Table.Cell>
				<Table.Cell>
					{#await client.api.statuses({ id: status.id }).get()}
						<span class="animate-pulse">
							Status
						</span>
					{:then { data }}
						{data?.name}
					{/await}
				</Table.Cell>
				<Table.Cell>{priority}</Table.Cell>
				<Table.Cell>{effort}</Table.Cell>
				<Table.Cell>{assignee}</Table.Cell>
				<Table.Cell>{value}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>  