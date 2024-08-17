<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
    import type { Efforts, Priorities, State, Value } from "@/server/db/types";
    import Input from "./ui/input/input.svelte";
    import Select from "./Select.svelte";
    import { EFFORTS, PRIORITIES, VALUES } from "@/global";
    import { Button } from "./ui/button";

	let { open = $bindable() }: { open: boolean } = $props();

	let title: string = $state("");
	let body: string = $state("");
	let status: { id: string, state: State } | null = $state(null);
	let priority: Priorities | null = $state(null);
	let effort: Efforts | null = $state(null);
	let value: Value | null = $state(null);
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
			<!-- <Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} /> -->
			<Select placeholder="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={priority} />
			<Select placeholder="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={effort} />
			<Select placeholder="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={value} />
		</div>
		<Dialog.Footer>
			<Button>Create</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>