<script lang="ts">
	import type { PageData } from "./$types";

	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";

	import "carta-md/default.css";
	import { CLASSES, EFFORTS, PRIORITIES, RESOLUTION_METHODS, STATES, VALUES, type SelectEntry } from "@/utils.ts";

	import "$lib/assets/github-carta.css";
	import Select from "@/components/Select.svelte";

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
    import { ListTree, OctagonX, Hammer, Link2 } from "lucide-svelte";
    import LabelSelect from "@/components/LabelSelect.svelte";
    import { blur } from "svelte/transition";
    import { on } from "svelte/events";

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		rendererDebounce: 10,
	});

	let add_update: boolean = $state(false);
	let show_resolve_menu: boolean = $state(false);

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

	let update = $state({ value: 0, note: "", time_spent: 0 });

	let close_as: string | undefined = $state(undefined);
	let close_payload: string | undefined = $state(undefined);

	$effect(() => {
		close_as; // Keep to trigger effect
		close_payload = undefined;
	});

	console.warn(data.labels);
</script>

<svelte:head>
	<title>{data.task.title}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10 shrink-0">
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
<div class="flex-1 flex">
	<div class="flex flex-col gap-4 flex-1 px-16 py-24">
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
				<input in:blur class="tactile-text text-5xl font-semibold p-0 border-0" value={data.task.title} onblur={async (e) => await updateTaskMutation({})({ id: data.task.id, title: e.target.value })}/>
				<!-- TODO: link to merge request -->
			</div>
			<Dialog.Root bind:open={show_resolve_menu}>
				<Dialog.Trigger class={buttonVariants({ variant: "default" })}>Close</Dialog.Trigger>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>Close {data.task.title}</Dialog.Title>
						<Dialog.Description>
							<Select label="Close as" values={RESOLUTION_METHODS} bind:value={close_as}/>
						</Dialog.Description>
					</Dialog.Header>
					{#if close_as === "Duplicate"}
						<Search placeholder="Select the original task" filter={{ class: "Task", exclude: [data.task.id] }} bind:value={close_payload}/>
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
						<Button title="Hey hey hey" type="submit" disabled={close_as === undefined || close_payload === undefined}>
							Close{close_as ? " as " + close_as.toLowerCase() : ""}
						</Button>
					</Dialog.Footer>
				</Dialog.Content>
			</Dialog.Root>
		</div>
		<LabelSelect value={data.task.labels.map(l => l.id)} labels={data.labels}/>
		<div class="h-64">
			<MarkdownEditor
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
	<side class="flex flex-col w-96 gap-8 px-6 py-8 border-l bg-neutral-950">
		<section class="column gap-2">
			<span class="text-muted-foreground text-sm flex-1">Assignee</span>
			<Search filter={{ class: "User" }} label="Assignee" value={data.task.assignee?.id} onselect={async (id) => await updateTaskMutation({})({ id: data.task.id, assignee: id })}/>
		</section>
		<section class="column gap-2">
			<div class="gallery gap-2 w-full">
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Status</span>
					<Select values={data.statuses.filter(s => s.state !== "Resolved").map(s => ({ label: s.name, value: s.id, icon: STATES.find(state => state.value === s.state)?.icon }) )} value={data.task.status?.id} onSelect={async (status) => await updateTaskMutation({})({ id: data.task.id, status })}/>
				</div>
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Priority</span>
					<Select values={PRIORITIES} value={data.task.priority} onSelect={async (priority) => await updateTaskMutation({})({ id: data.task.id, priority })}/>
				</div>
			</div>
			<div class="gallery gap-2 w-full">
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Effort</span>
					<Select values={EFFORTS} value={data.task.effort} onSelect={async (effort) => await updateTaskMutation({})({ id: data.task.id, effort })}/>
				</div>
				<div class="column gap-2 flex-1">
					<span class="text-muted-foreground text-sm">Value</span>
					<Select values={VALUES} value={data.task.value} onSelect={async (value) => await updateTaskMutation({})({ id: data.task.id, value })}/>
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
