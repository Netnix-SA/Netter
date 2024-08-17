<script lang="ts">
	import type { PageData } from "./$types";

	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";

	import { Separator } from "$lib/components/ui/separator";
	import "carta-md/default.css";
	import Label from "@/components/ui/label/label.svelte";
	import { EFFORTS, PRIORITIES, RESOLUTION_METHODS, STATES, VALUES, type SelectEntry } from "@/global";
	import UserSelect from "@/components/UserSelect.svelte";

	import "$lib/assets/github-carta.css";
	import Select from "@/components/Select.svelte";
    import TaskChip from "@/components/TaskChip.svelte";
    import type { Efforts, Priorities, State, Value } from "@/server/db/types";
    import LabelChip from "@/components/LabelChip.svelte";
    import Button from "@/components/ui/button/button.svelte";
	import * as Dialog from "$lib/components/ui/dialog";
    import { buttonVariants } from "@/components/ui/button";
    import { onMount } from "svelte";
    import { commands } from "@/state";
    import ChannelView from "@/components/ChannelView.svelte";
    import ComboBox from "@/components/ComboBox.svelte";
    import Input from "@/components/ui/input/input.svelte";
    import Circle from "@/components/Circle.svelte";

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		rendererDebounce: 10,
	});

	let add_child: boolean | undefined = $state(undefined);
	let add_relative: boolean | undefined = $state(undefined);
	let add_blocker: boolean | undefined = $state(undefined);
	let add_update: boolean | undefined = $state(undefined);
	let show_resolve_menu: boolean | undefined = $state(undefined);

	onMount(() => {
		const entry = {
			name: "Task",
			commands: [
				{ name: "Add to ToDo's", do: () => {} },
				{
					name: "Add blocker",
					do: () => {
						add_blocker = true;
					}
				},
				{
					name: "Add child",
					do: () => {
						add_child = true;
					}
				},
				{
					name: "Add relative",
					do: () => {
						add_relative = true;
					}
				},
				{
					name: "Add update",
					key: 'u',
					do: () => {
						add_update = true;
					}
				},
				{
					name: "Resolve task",
					key: 'r',
					do: () => {
						show_resolve_menu = true;
					}
				},
			]
		};

		commands.update(c => {
			c.push(entry);
			return c;
		});

		return () => {
			commands.update(c => { return c.filter(e => e != entry); });
		};
	});

	const { data }: { data: PageData } = $props();

	let body: string = $state(data.task.body);
	let status: { id: string, state: State } | null = $state(data.statuses.find(s => s.id === data.task.status) || null);
	let priority: Priorities | null = $state(data.task.priority);
	let effort: Efforts | null = $state(data.task.effort);
	let value: Value | null = $state(data.task.value);

	let close_as: string | undefined = $state(undefined);
	let close_payload: string | undefined = $state(undefined);

	$effect(() => {
		close_as; // Keep to trigger effect
		close_payload = undefined;
	});

	let assignee = $state(
		data.users.find((u) => u.id === data.task.assignee?.id) || null,
	);
</script>

<div class="flex">
	<div class="flex flex-col w-[64em]">
		<div class="gallery">
			<div id="left" class="flex-1 gallery">
				<Dialog.Root>
					<Dialog.Trigger><Circle value={data.task.progress} /></Dialog.Trigger>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Updates to {data.task.title}</Dialog.Title>
							<Dialog.Description>
							</Dialog.Description>
						</Dialog.Header>
						<ul>
							{#each data.task.updates as update}
								<li class="gallery gap-2 h-8 border-b">
									<span class="tactile-text text-sm border-r pr-2">{update.value}%</span>
									<span class="text-sm">{update.note}</span>
								</li>
							{:else}
								<li class="text-muted-foreground text-sm text-center italic">No updates yet!</li>
							{/each}
						</ul>
						<Dialog.Footer>
							<Button type="submit" onclick={() => add_update = true}>Add update</Button>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root>
				<input class="text-2xl tactile-text flex-1 border-b border-opacity-0 focus:border-opacity-100 outline-none transition-all" bind:value={data.task.title}/>
				<!-- TODO: link to merge request -->
			</div>
			<Dialog.Root bind:open={show_resolve_menu}>
				<Dialog.Trigger class={buttonVariants({ variant: "default" })}>Close</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Close {data.task.title}</Dialog.Title>
						<Dialog.Description>
							<Select label="Close as" comparator={(a, b) => a === b} values={RESOLUTION_METHODS} bind:value={close_as}/>
						</Dialog.Description>
					</Dialog.Header>
					{#if close_as === "Duplicate"}
						<ComboBox placeholder="Select the original task" entries={data.tasks.map((task) => ({ label: task.title, value: task.id }))} onSelect={(e) => close_payload = e}/>
					{:else if close_as === "Resolved"}
						<div class="flex gap-2">
							<textarea class="appearance-none outline-none rounded-lg bg-card px-2 py-1 border h-[8lh] w-full" placeholder="Resolution" bind:value={close_payload}/>
						</div>
					{:else if close_as === "Canceled"}
						<div class="flex gap-2">
							<textarea class="appearance-none outline-none rounded-lg bg-card px-2 py-1 border h-[8lh] w-full" placeholder="Reason for canceling" bind:value={close_payload}/>
						</div>
					{/if}
					<Dialog.Footer>
						<Button title="Hey hey hey" type="submit" disabled={close_as === undefined || close_payload === undefined}>Close{close_as ? " as " + close_as.toLowerCase() : ""}</Button>
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
		<Separator class="my-8"/>
		<div class="h-56">
			<MarkdownEditor
				bind:value={body}
				mode="tabs"
				theme="github"
				{carta}
			/>
		</div>
		<Separator class="my-8"/>
		<div id="comments" class="column gap-1">
			<span class="text-muted-foreground text-sm">Comments</span>
			<div class="h-64 rounded-lg border column overflow-hidden">
				<!-- <ChannelView channel={data.task.channel} messages={data.messages} users={data.users}/> -->
			</div>
		</div>
	</div>
	<Separator orientation="vertical" class="mx-8" />
	<div class="flex flex-col w-64 gap-2">
		<UserSelect
			label="Assignee"
			values={data.users}
			bind:value={assignee}
		/>
		<Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.filter(s => s.state !== "Resolved").map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
		<Select label="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={priority} />
		<Select label="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={effort} />
		<Select label="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={value} />
		<Separator orientation="horizontal" class="my-8" />
		<Label>Children</Label>
		{#each data.task.relatives.children as child(child.id)}
			<TaskChip id={child.id} tasks={data.tasks}/>
		{:else}
			<Dialog.Root bind:open={add_child}>
				<Dialog.Trigger class="rounded-lg border border-dashed text-muted-foreground frame text-sm h-10 hover:text-base transition-all">
					+ Add child
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Add child to {data.task.title}</Dialog.Title>
					</Dialog.Header>
					<ComboBox placeholder="Select the child task" entries={data.tasks.map((task) => ({ label: task.title, value: task.id }))}/>
					<Dialog.Footer>
						<Button type="submit" disabled={close_as === undefined}>Add child task</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/each}
		<Label>Related</Label>
		{#each data.task.relatives.related as relative}
			<TaskChip id={relative.id} tasks={data.tasks}/>
		{:else}
			<Dialog.Root bind:open={add_relative}>
				<Dialog.Trigger class="rounded-lg border border-dashed text-muted-foreground frame text-sm h-10 hover:text-base transition-all">
					+ Add relative
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Add relative to {data.task.title}</Dialog.Title>
					</Dialog.Header>
					<ComboBox placeholder="Select the related task" entries={data.tasks.map((task) => ({ label: task.title, value: task.id }))}/>
					<Dialog.Footer>
						<Button type="submit" disabled={close_as === undefined}>Add related task</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/each}
		<Label>Blocked by</Label>
		{#each data.task.relatives.blockers as blocker}
			<TaskChip id={blocker.id} tasks={data.tasks}/>
		{:else}
			<Dialog.Root bind:open={add_blocker}>
				<Dialog.Trigger class="rounded-lg border border-dashed text-muted-foreground frame text-sm h-10 hover:text-base transition-all">
					+ Add blocker
				</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Add blocker to {data.task.title}</Dialog.Title>
					</Dialog.Header>
					<ComboBox placeholder="Select the blocker task" entries={data.tasks.map((task) => ({ label: task.title, value: task.id }))}/>
					<Dialog.Footer>
						<Button type="submit" disabled={close_as === undefined}>Add blocker task</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		{/each}
	</div>
</div>

<Dialog.Footer>
	<Dialog.Root bind:open={add_update}>
		<Dialog.Content class="sm:max-w-[425px]">
			<Dialog.Header>
				<Dialog.Title>Add update to {data.task.title}</Dialog.Title>
				<Dialog.Description>
				</Dialog.Description>
			</Dialog.Header>
			<div class="gallery gap-2 w-full">
				<div class="column w-full">
					<span class="text-muted-foreground text-sm">Progress</span>
					<Input type="number" max="100" min="0" class="w-16"/>
				</div>
				<div class="column w-full">
					<span class="text-muted-foreground text-sm">Time spent</span>
					<Input type="number" min="0" max="100" class="w-16"/>
				</div>
			</div>
			<span class="text-muted-foreground text-sm">Note</span>
			<Input type="text"/>
			<Dialog.Footer>
				<Button title="Hey hey hey" type="submit">Add update</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</Dialog.Footer>