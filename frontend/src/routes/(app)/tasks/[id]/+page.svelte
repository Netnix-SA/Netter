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
    import type { Efforts, Priorities, State, Value } from "../db/types";
    import LabelChip from "@/components/LabelChip.svelte";

    import Button from "@/components/ui/button/button.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Dialog from "$lib/components/ui/dialog";

    import { buttonVariants } from "@/components/ui/button";
    import { onMount } from "svelte";
    import { client, commands } from "@/state";
    import ChannelView from "@/components/ChannelView.svelte";
    import ComboBox from "@/components/ComboBox.svelte";
    import Input from "@/components/ui/input/input.svelte";
    import Circle from "@/components/Circle.svelte";
    import AnyChip from "@/components/AnyChip.svelte";
    import { Loading } from "@/components/ui/command";

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

	async function addUpdate() {
		await client.api.tasks({ id: data.task.id }).updates.post({
			value: update.value,
			note: update.note,
			time_spent: update.time_spent,
		});
	}

	const { data }: { data: PageData } = $props();

	let body: string = $state(data.task.body);
	let status: { id: string, state: State } | null = $state(data.statuses.find(s => s.id === data.task.status) || null);
	let priority: Priorities | null = $state(data.task.priority);
	let effort: Efforts | null = $state(data.task.effort);
	let value: Value | null = $state(data.task.value);

	let update = $state({ value: 0, note: "", time_spent: 0 });

	let close_as: string | undefined = $state(undefined);
	let close_payload: string | undefined = $state(undefined);

	$effect(() => {
		close_as; // Keep to trigger effect
		close_payload = undefined;
	});

	let assignee = $state(
		data.users.find((u) => u.id === data.task.assignee?.id) || null,
	);

	$inspect(data.task);
</script>

<svelte:head>
	<title>{data.task.title}</title>
</svelte:head>

<div class="flex">
	<div class="flex flex-col w-[64em]">
		<div class="gallery">
			<div id="left" class="flex-1 gallery gap-2">
				<Dialog.Root>
					<Dialog.Trigger><Circle value={data.task.progress} /></Dialog.Trigger>
					<Dialog.Content class="sm:max-w-[425px]">
						<Dialog.Header>
							<Dialog.Title>Updates to {data.task.title}</Dialog.Title>
							<Dialog.Description>
							</Dialog.Description>
						</Dialog.Header>
						<ul class="max-h-96 overflow-scroll">
							{#each data.task.updates as update}
								<li class="gallery gap-2 min-h-12 py-2 max-h-32 border-b">
									<span class="tactile-text text-sm border-r pr-2">{update.value}%</span>
									<span class="text-sm whitespace-pre-wrap truncate">{update.note}</span>
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
				<input class="text-4xl tactile-text flex-1 border-b border-opacity-0 focus:border-opacity-100 outline-none transition-all" bind:value={data.task.title}/>
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
		<div class="mt-4 gallery w-full overflow-x-scroll gap-3">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame border border-dashed text-md hover:text-xl transition-all bg-primary-foreground rounded-md" title="Add label">
					+
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each data.labels as label}
						<DropdownMenu.Item class="gallery gap-2" onclick={() => { data.task.labels.push({ id: label.id }); data.task = data.task; }}>
							{label.icon} {label.title}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			{#each data.task.labels as { id }}
				{@const label = data.labels.find((l) => l.id === id)}
				<LabelChip {label} />
			{/each}
		</div>
		<Separator class="my-6"/>
		<div class="h-64">
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
			<div class="h-72 rounded-lg border column overflow-hidden">
				<ChannelView channel={data.channel} messages={data.messages} users={data.users}/>
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
		<div class="gallery gap-2 w-full">
			<Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.filter(s => s.state !== "Resolved").map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
			<Select label="Priority" comparator={(a, b) => a === b} values={PRIORITIES} bind:value={priority}/>
		</div>
		<div class="gallery gap-2 w-full">
			<Select label="Effort" comparator={(a, b) => a === b} values={EFFORTS} bind:value={effort}/>
			<Select label="Value" comparator={(a, b) => a === b} values={VALUES} bind:value={value}/>
		</div>
		<Separator orientation="horizontal" class="my-4"/>
		{#await data.related}
			Loading related tasks...
		{:then related}
		{#if related.length > 0}
			<Label>Related</Label>
			<div class="column h-24 overflow-scroll">
				{#each related as relative}
					<AnyChip id={relative.id}/>
				{/each}
			</div>
		{:else}
			<Label>Related</Label>
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
		{/if}
		{/await}
		<Separator orientation="horizontal" class="my-4"/>
		{#await data.tackled}
			Loading tackled tasks...
		{:then tackled}
			{#if tackled.length > 0}
				<Label>Tackles</Label>
				<div class="column h-24 overflow-scroll">
					{#each tackled as item}
						<AnyChip id={item.id}/>
					{/each}
				</div>
			{:else}
				<Label>Tackles</Label>
			{/if}
		{/await}
		<Separator orientation="horizontal" class="my-4"/>
		<div class="column">
			{#await data.children}
				Loading children...
			{:then children}
				{#if children.length > 0}
					<div class="gallery">
						<span class="text-muted-foreground text-xs flex-1">
							Children
						</span>
						<button onclick={() => add_child = true} class="tactile-text frame text-lg pr-1 font-bold">
							+
						</button>
					</div>
					{#each children as child(child.id)}
						<AnyChip id={child.id}/>
					{/each}
				{:else}
					<div class="column gap-2">
						<span class="text-muted-foreground text-xs flex-1">
							Children
						</span>
						<button onclick={() => add_child = true} class="rounded-lg border border-dashed text-muted-foreground frame text-sm h-10 hover:text-base transition-all">
							+ Add child
						</button>
					</div>
				{/if}
			{/await}
		</div>
		<Label>Blocked by</Label>
		{#await data.blockers}
			Loading blocking tasks...
		{:then blockers}
			{#each blockers as blocker}
				<AnyChip id={blocker.id}/>
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
		{/await}
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
					<Input type="number" max="100" min="0" class="w-16" bind:value={update.value}/>
				</div>
				<div class="column w-full">
					<span class="text-muted-foreground text-sm">Time spent</span>
					<Input type="number" min="0" max={60 * 24} class="w-16" bind:value={update.time_spent}/>
				</div>
			</div>
			<span class="text-muted-foreground text-sm">Note</span>
			<Input type="text" bind:value={update.note}/>
			<Dialog.Footer>
				<Button title="Hey hey hey" onclick={async () => { addUpdate(); add_update = false; }} type="submit">Add update</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
</Dialog.Footer>

<Dialog.Root bind:open={add_child}>
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