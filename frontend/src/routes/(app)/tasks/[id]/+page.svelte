<script lang="ts">
	import type { PageData } from "./$types";

	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";

	import "carta-md/default.css";
	import Label from "@/components/ui/label/label.svelte";
	import { CLASSES, EFFORTS, PRIORITIES, RESOLUTION_METHODS, STATES, VALUES, type SelectEntry } from "@/global";

	import "$lib/assets/github-carta.css";
	import Select from "@/components/Select.svelte";
    import type { Efforts, Priorities, State, Value } from "../db/types";
    import LabelChip from "@/components/LabelChip.svelte";

    import Button from "@/components/ui/button/button.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Dialog from "$lib/components/ui/dialog";
    import { DotsHorizontal } from "svelte-radix";

    import { buttonVariants } from "@/components/ui/button";
    import { onMount } from "svelte";
    import { addTaskBlockerMutation, addTaskChildMutation, addTaskRelativeMutation, addTaskTackledMutation, client, commands, removeBlockerTaskMutation, removeChildTaskMutation, removeRelativeTaskMutation, removeTackledMutation, updateTaskMutation } from "@/state";
    import ChannelView from "@/components/ChannelView.svelte";
    import DialogSelect from "@/components/DialogSelect.svelte";
    import Input from "@/components/ui/input/input.svelte";
    import Circle from "@/components/Circle.svelte";
    import AnyChip from "@/components/AnyChip.svelte";
    import { onNavigate } from "$app/navigation";
    import Search from "@/components/Search.svelte";
    import { task } from "@/all.svelte";
    import { ListTree, OctagonX, Hammer, Link2 } from "lucide-svelte";

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		rendererDebounce: 10,
	});

	let add_update: boolean | undefined = $state(undefined);
	let show_resolve_menu: boolean | undefined = $state(undefined);

	onMount(() => {
		const entry = {
			name: "Task",
			commands: [
				// { name: "Add to ToDo's", do: () => {} },
				// {
				// 	name: "Add blocker",
				// 	do: () => {
				// 		add_blocker = true;
				// 	}
				// },
				// {
				// 	name: "Add child",
				// 	do: () => {
				// 		add_child = true;
				// 	}
				// },
				// {
				// 	name: "Add relative",
				// 	do: () => {
				// 		add_relative = true;
				// 	}
				// },
				// {
				// 	name: "Add update",
				// 	key: 'u',
				// 	do: () => {
				// 		add_update = true;
				// 	}
				// },
				// {
				// 	name: "Resolve task",
				// 	key: 'r',
				// 	do: () => {
				// 		show_resolve_menu = true;
				// 	}
				// },
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

	let title: string = $state(data.task.title);
	let body: string = $state(data.task.body);
	let status: { id: string, state: State } | null = $state(data.statuses.find(s => s.id === data.task.status.id) || null);
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

	let assignee: string | null = $state(
		data.users.find((u) => u.id === data.task.assignee?.id) || null,
	);

	onNavigate(async () => {
		await updateTaskMutation({})({ id: data.task.id, title, body, priority, effort, value });
	});
</script>

<svelte:head>
	<title>{data.task.title}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="flex-1">
		<h1 class="tactile-text text-sm">
			{data.task.title}
		</h1>
	</div>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each CLASSES["Task"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<DropdownMenu.Separator/>
			{/if}
			<DropdownMenu.Item onclick={async () => await action({}, data.task.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>
<div class="flex-1 flex p-24">
	<div class="flex flex-col gap-4 w-[64em]">
		<div class="gallery gap-8">
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
				<input class="text-4xl tactile-text flex-1 border-b border-opacity-0 focus:border-opacity-100 outline-none transition-all" bind:value={title}/>
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
						<Search placeholder="Select the original task" filter={{ class: "Task", exclude: [data.task.id] }} onSelect={(e) => close_payload = e}/>
					{:else if close_as === "Resolved"}
						<div class="flex gap-2">
							<textarea class="appearance-none outline-none rounded-lg bg-card px-2 py-1 border h-[8lh] w-full" placeholder="Resolution" bind:value={close_payload}>
							</textarea>
						</div>
					{:else if close_as === "Canceled"}
						<div class="flex gap-2">
							<textarea class="appearance-none outline-none rounded-lg bg-card px-2 py-1 border h-[8lh] w-full" placeholder="Reason for canceling" bind:value={close_payload}>
							</textarea>
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
		<div class="h-64">
			<MarkdownEditor
				bind:value={body}
				mode="tabs"
				theme="github"
				{carta}
			/>
		</div>
		<div id="comments" class="column gap-1">
			<span class="text-muted-foreground text-sm">Comments</span>
			<div class="h-72 rounded-lg border column overflow-hidden">
				<ChannelView channel={data.channel} messages={data.messages} users={data.users}/>
			</div>
		</div>
	</div>
	<side class="flex flex-col w-96 gap-8 px-12">
		<section class="column gap-2">
			<span class="text-muted-foreground text-sm flex-1">Assignee</span>
			<Search filter={{ class: "User" }} label="Assignee" bind:value={assignee}/>
		</section>
		<section class="column gap-2">
			<div class="gallery gap-2 w-full">
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Status</span>
					<Select comparator={(a, b) => a.id === b.id} values={data.statuses.filter(s => s.state !== "Resolved").map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={status} />
				</div>
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Priority</span>
					<Select comparator={(a, b) => a === b} values={PRIORITIES} bind:value={priority}/>
				</div>
			</div>
			<div class="gallery gap-2 w-full">
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Effort</span>
					<Select comparator={(a, b) => a === b} values={EFFORTS} bind:value={effort}/>
				</div>
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Value</span>
					<Select comparator={(a, b) => a === b} values={VALUES} bind:value={value}/>
				</div>
			</div>
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Related
				</span>
				<DialogSelect onselect={(id) => addTaskRelativeMutation({})({ id: data.task.id, relative_id: id })} filter={{ class: "Task", exclude: [data.task.id] }}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			{#await data.related}
				Loading related tasks...
			{:then related}
				<div class="column h-24 overflow-scroll">
					{#each related as relative}
						<AnyChip id={relative.id} context={{ name: "Relative", actions: [{ label: "Remove relative", icon: Link2, action: (ctx, id) => removeRelativeTaskMutation(ctx)({ id: data.task.id, relative_id: id }) }] }}/>
					{:else}
						<div class="frame h-24">
							<span class="text-muted-foreground/50 text-sm italic">No relatives</span>
						</div>
					{/each}
				</div>
			{/await}
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Tackles
				</span>
				<DialogSelect onselect={(id) => addTaskTackledMutation({})({ id: data.task.id, tackled_id: id })} filter={{ class: "Feature" }}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			{#await data.tackled}
				Loading tackled tasks...
			{:then tackled}
				<div class="column h-24 overflow-scroll">
					{#each tackled as item}
						<AnyChip id={item.id} context={{ name: "Tackled", actions: [{ label: "Remove tackled", icon: Hammer, action: (ctx, id) => removeTackledMutation(ctx)({ id: data.task.id, tackled_id: id }) }] }}/>
					{:else}
						<div class="frame h-24">
							<span class="text-muted-foreground/50 text-sm italic">No tackled</span>
						</div>
					{/each}
				</div>
			{/await}
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Children
				</span>
				<DialogSelect onselect={(id) => addTaskChildMutation({})({ id: data.task.id, child_id: id })} filter={{ class: "Task", exclude: [data.task.id] }}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			<div class="column">
				{#await data.children}
					Loading children...
				{:then children}
					{#each children as child(child.id)}
						<AnyChip id={child.id} context={{ name: "Child", actions: [{ label: "Remove child", icon: ListTree, action: (ctx, id) => removeChildTaskMutation(ctx)({ id: data.task.id, child_id: id }) }] }}/>
					{:else}
						<div class="frame h-24">
							<span class="text-muted-foreground/50 text-sm italic">No children</span>
						</div>
					{/each}	
				{/await}
			</div>
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Blockers
				</span>
				<DialogSelect onselect={(id) => addTaskBlockerMutation({})({ id: data.task.id, blocker_id: id })} filter={{ class: "Task", exclude: [data.task.id] }}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			{#await data.blockers}
				Loading blocking tasks...
			{:then blockers}
				{#each blockers as blocker}
					<AnyChip id={blocker.id} context={{ name: "Blocker", actions: [{ label: "Remove blocker", icon: OctagonX, action: (ctx, id) => removeBlockerTaskMutation(ctx)({ id: data.task.id, blocker_id: id }) }] }}/>
				{:else}
					<div class="frame h-24">
						<span class="text-muted-foreground/50 text-sm italic">No blockers</span>
					</div>
				{/each}
			{/await}
		</section>
	</side>
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
