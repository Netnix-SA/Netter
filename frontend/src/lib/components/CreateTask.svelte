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

	let { statuses, users, open = $bindable() }: { users: User[], statuses: { id: string, name: string, state: State, }[], open: boolean } = $props();

	let title: string = $state("");
	let body: string = $state("");
	let status: { id: string, state: State } | null = $state(null);
	let assignee: User | null = $state(null);
	let priority: Priorities | null = $state(null);
	let effort: Efforts | null = $state(null);
	let value: Value | null = $state(null);

	async function createTask() {
		await client.api.tasks.post({
			title,
			body,
			status: status?.id || null,
			priority,
			effort,
			value,
			assignee: assignee?.id || null,
		});
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>
				<Input type="text" placeholder="Title" class="mr-8" bind:value={title}/>
			</Dialog.Title>
		</Dialog.Header>
		<Input type="text" placeholder="Description" bind:value={body}/>
		<div class="w-full flex flex-wrap gap-2">
			<UserSelect values={users} bind:value={assignee}/>
			<Select placeholder="Status" comparator={(a, b) => a.id === b.id} values={statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
			<Select placeholder="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={priority} />
			<Select placeholder="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={effort} />
			<Select placeholder="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={value} />
		</div>
		<Dialog.Footer>
			<Button onclick={createTask}>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>