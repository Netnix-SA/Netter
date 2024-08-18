<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
    import type { Efforts, Priorities, State, Value } from "../db/types";
    import Input from "./ui/input/input.svelte";
    import Select from "./Select.svelte";
    import { EFFORTS, PRIORITIES, STATES, VALUES } from "@/global";
    import { Button } from "./ui/button";
    import { Star } from "lucide-svelte";
    import { client } from "@/state";
    import UserSelect from "./UserSelect.svelte";

	type User = { id: string, full_name: string };

	let { project, statuses, users, open = $bindable() }: { project: string | undefined, users: User[], statuses: { id: string, name: string, state: State, }[], open: boolean } = $props();

	let title: string = $state("");
	let body: string = $state("");
	let status: { id: string, state: State } | null = $state(null);
	let assignee: User | null = $state(null);
	let priority: Priorities | null = $state(null);
	let effort: Efforts | null = $state(null);
	let value: Value | null = $state(null);

	async function createTask() {
		if (project === undefined) {
			await client.api.tasks.post({
				title,
				body,
				status: status?.id || null,
				priority,
				effort,
				value,
				assignee: assignee?.id || null,
			});
		} else {
			await client.api.projects({ id: project }).tasks.post({
				title,
				body,
				status: status?.id || null,
				priority,
				effort,
				value,
				assignee: assignee?.id || null,
			});
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				Create task
			</Dialog.Title>
		</Dialog.Header>
		<input type="text" placeholder="Title" class="border-b appearance-none outline-none text-2xl tactile-text bg-transparent" bind:value={title}/>
		<textarea class="bg-transparent text-sm min-h-[2lh]" placeholder="Description" bind:value={body}>
		</textarea>
		<div class="w-full flex flex-wrap gap-2">
			<UserSelect values={users} bind:value={assignee}/>
			<Select variant="icon" placeholder="Status" comparator={(a, b) => a.id === b.id} values={statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
			<Select variant="icon" placeholder="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={priority} />
			<Select variant="icon" placeholder="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={effort} />
			<Select variant="icon" placeholder="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={value} />
		</div>
		<Dialog.Footer>
			<Button onclick={createTask}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>