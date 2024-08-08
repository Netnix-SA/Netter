<script lang="ts">
	import type { PageData } from "./$types";

	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";

	import { Separator } from "$lib/components/ui/separator";
	import "carta-md/default.css";
	import Label from "@/components/ui/label/label.svelte";
	import { EFFORTS, PRIORITIES, STATES, type SelectEntry } from "@/global";
	import UserSelect from "@/components/UserSelect.svelte";

	import "$lib/assets/github-carta.css";
	import Select from "@/components/Select.svelte";
    import { Check, Star } from "lucide-svelte";
    import TaskChip from "@/components/TaskChip.svelte";
    import type { Efforts, Priorities, State } from "@/server/db/types";
    import LabelChip from "@/components/LabelChip.svelte";
    import Button from "@/components/ui/button/button.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
    import { buttonVariants } from "@/components/ui/button";

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		rendererDebounce: 10,
	});

	const { data }: { data: PageData } = $props();

	let body: string = $state(data.task.body);
	let status: { id: string, state: State } | null = $state(data.statuses.find(s => s.id === data.task.status) || null);
	let priority: Priorities | null = $state(data.task.priority);
	let effort: Efforts | null = $state(data.task.effort);

	let assignee = $state(
		data.users.find((u) => u.id === data.task.assignee?.id) || null,
	);

	$inspect(status);
</script>

<div class="flex">
	<div class="flex flex-col w-[64em]">
		<div class="gallery">
			<h1 class="text-2xl tactile-text flex-1">
				{data.task.title}
			</h1>
			<Dialog.Root>
				<Dialog.Trigger class={buttonVariants({ variant: "default" })}>Close</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
				  <Dialog.Header>
					<Dialog.Title>Edit profile</Dialog.Title>
					<Dialog.Description>
					  Make changes to your profile here. Click save when you're done.
					  <Select label="Close as" comparator={(a, b) => a === b} values={[{ label: "Resolved", value: "Resolved", icon: Check }]} bind:value={effort} />
					</Dialog.Description>
				  </Dialog.Header>
				  <Dialog.Footer>
					<Button type="submit">Save changes</Button>
				  </Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<div class="mt-2">
			{#each data.task.labels as { id }}
				{@const label = data.labels.find((l) => l.id === id)}
				<LabelChip {label} />
			{/each}
		</div>
		<Separator class="my-8" />
		<div class="h-64">
			<MarkdownEditor
				bind:value={body}
				mode="tabs"
				theme="github"
				{carta}
			/>
		</div>
		<div id="comments">
			Comments
			<div class="h-32"></div>
		</div>
	</div>
	<Separator orientation="vertical" class="mx-8" />
	<div class="flex flex-col w-64 gap-2">
		<UserSelect
			label="Assignee"
			values={data.users}
			bind:value={assignee}
		/>
		<Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
		<Select label="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={priority} />
		<Select label="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={effort} />
		<Separator orientation="horizontal" class="my-8" />
		<Label>Children</Label>
		{#each data.task.relatives.children as child(child.id)}
			<TaskChip id={child.id} tasks={data.tasks}/>
		{/each}
		<Label>Related</Label>
		{#each data.task.relatives.related as relative}
			<TaskChip id={relative.id} tasks={data.tasks}/>
		{/each}
		<Label>Blocked by</Label>
		{#each data.task.relatives.blockers as blocker}
			<TaskChip id={blocker.id} tasks={data.tasks}/>
		{/each}
	</div>
</div>
