<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
    import type { Efforts, Priorities, State, Value } from "../db/types";
    import Select from "./Select.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { EFFORTS, PRIORITIES, STATES, VALUES } from "@/global";
    import { Button } from "./ui/button";
    import { Star } from "lucide-svelte";
    import { client } from "@/state";
    import UserSelect from "./UserSelect.svelte";
    import LabelChip from "./LabelChip.svelte";
    import type { Colors } from "@/types";

	type User = { id: string, full_name: string };

	type Task = {
		title: string, body: string,
		status: { id: string, },
		priority: Priorities, effort: Efforts, value: Value,
		assignee: { id: string } | null,
		labels: { id: string }[],
	};

	let { task, project, statuses, users, labels }: { task: Task, project: string | undefined, users: User[], labels: { id: string, icon: string, title: string, color: Colors }[], statuses: { id: string, name: string, state: State, }[], } = $props();

	async function createTask() {
		if (project === undefined) {
			await client.api.tasks.post({
				title: task.title,
				body: task.body,
				status: task.status?.id || null,
				priority: task.priority,
				effort: task.effort,
				value: task.value,
				assignee: task.assignee?.id || null,
			});
		} else {
			await client.api.projects({ id: project }).tasks.post({
				title: task.title,
				body: task.body,
				status: task.status?.id || null,
				priority: task.priority,
				effort: task.effort,
				value: task.value,
				assignee: task.assignee?.id || null,
			});
		}
	}

	$inspect(task);
</script>

<Dialog.Root open={true}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				Create task
			</Dialog.Title>
		</Dialog.Header>
		<input type="text" placeholder="Title" class="border-b appearance-none outline-none text-2xl tactile-text bg-transparent" bind:value={task.title}/>
		<div class="mt-4 gallery w-full gap-3">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame border border-dashed text-md hover:text-xl transition-all bg-primary-foreground rounded-md" title="Add label">
					+
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each labels.filter(l => !task.labels.some(tl => tl.id === l.id)) as label}
						<DropdownMenu.Item class="gallery gap-2" onclick={() => { task.labels.push({ id: label.id }); }}>
							{label.icon} {label.title}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<div class="gallery gap-3 overflow-scroll w-full">
				{#each task.labels.filter(l => l.id) as { id }}
					{@const label = labels.find((l) => l.id === id)}
					<LabelChip {label} />
				{/each}
			</div>
		</div>
		<textarea class="bg-transparent text-sm min-h-[2lh]" placeholder="Description" bind:value={task.body}>
		</textarea>
		<div class="w-full flex flex-wrap gap-2">
			<UserSelect values={users} bind:value={task.assignee}/>
			<Select variant="small" placeholder="Status" comparator={(a, b) => a.id === b.id} values={statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={task.status} />
			<Select variant="small" placeholder="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={task.priority} />
			<Select variant="small" placeholder="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={task.effort} />
			<Select variant="small" placeholder="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={task.value} />
		</div>
		<Dialog.Footer>
			<Button onclick={createTask}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>