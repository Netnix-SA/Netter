<script lang="ts">
	import { STATES } from "@/utils.ts";
	import type { PageData } from "./$types";
	import { filterTask, groupBy } from "@/utils";
    import Label from "@/components/LabelChip.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tabs from "$lib/components/ui/tabs";
    import { Filter, Kanban, List, Plus, Share2 } from "lucide-svelte";

	let { data }: { data: PageData } = $props();

	let filters: ((StateFilter | StatusFilter | TextFilter | LabelFilter) & { display: string })[] = $state([]);

	let tasks = $derived(data.tasks);

	let groups = $derived(data.statuses.map(s => [s, tasks.filter(t => filters.every(filter => filterTask(t, filter, data.statuses)))]));

	import { client, commands } from "@/state";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import UserAvatar from "@/components/UserAvatar.svelte";
    import Input from "@/components/ui/input/input.svelte";

	onMount(() => {
		const entry = { name: "Project", commands: [{ name: "Create task", key: 'c', do: () => {
			// open_create_task = true;
		} }] };

		commands.update(c => {
			c.push(entry);
			return c;
		});

		task.project = data.project.id;

		return () => {
			commands.update(c => { return c.filter(e => e != entry); });
		};
	});

	let view: "list" | "kanban" | "graph" = $state("list");

	import { writable, type Writable } from 'svelte/store';

	import { SvelteFlow, Controls, Background, BackgroundVariant, MiniMap, type Node, type Edge } from '@xyflow/svelte';
	import '@xyflow/svelte/dist/style.css';

    import type { LabelFilter, StateFilter, StatusFilter, TextFilter } from "@/types";
    import Circle from "@/components/Circle.svelte";
    import TaskList from "@/components/TaskList.svelte";
    import Filters from "@/components/filters/Filters.svelte";
    import { task } from "@/global.svelte.ts";
    import Search from "@/components/Search.svelte";

	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes: Writable<Node[]> = writable([]);

	// same for edges
	const edges: Writable<Edge[]> = writable([]);

	$effect(() => {
		// const nds = data.tasks.map(task => ({
		// 	id: task.id,
		// 	type: 'default',
		// 	data: { label: task.title },
		// 	position: { x: 0, y: 0 }
		// }));

		// nodes.set(nds);

		// const edgs = data.tasks.map(task => {
		// 	return task.relatives.children.map(child => {
		// 		return {
		// 			id: `${task.id}-${child.id}`,
		// 			source: task.id,
		// 			target: child.id,
		// 			type: 'default'
		// 		};
		// 	});
		// }).flat();

		// edges.set(edgs);
	});

	const snapGrid: [number, number] = [25, 25];
</script>

<svelte:head>
	<title>{"Project > Tasks"}</title>
</svelte:head>

<div class="flex-1 w-full flex flex-col">
	<div class="h-10 gallery px-4 border-b">
		<div id="left" class="flex-1 gallery gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<div class="frame rounded size-6 hover:w-fit border border-dashed hover:bg-primary-foreground group transition-all gap-1 hover:px-2">
						<Filter class="size-4 group-hover:green-light"/>
						<span class="hidden group-hover:block w-0 tactile-text group-hover:w-min text-sm text-clip text-nowrap">
							Add filter
						</span>
					</div>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>Add filter</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>State</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each STATES as state}
									<DropdownMenu.Item onclick={() => filters.push({ type: "State", operation: '=', value: state.value, display: state.label })}>{state.label}</DropdownMenu.Item>
								{/each}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Assignee</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent class="w-fit">
								<Search filter={{ class: "User" }}/>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Label</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each data.labels as label}
									<DropdownMenu.Item onclick={() => filters.push({ type: "Label", operation: 'CONTAINS', value: label.id, display: label.title })}>{label.title}</DropdownMenu.Item>
								{/each}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Status</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{#each data.statuses as status}
									<DropdownMenu.Item onclick={() => filters.push({ type: "Status", operation: '=', value: status.id, display: status.name })}>{status.name}</DropdownMenu.Item>
								{/each}
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Text</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<Input onkeydown={(e) => { if (e.key === 'Enter') { filters.push({ type: "Text", operation: 'IN', value: e.currentTarget.value, display: `"${e.currentTarget.value}"` }); e.currentTarget.blur(); } }}/>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<Filters bind:filters/>
		</div>
		<div id="right" class="gallery gap-4">
			<div class="h-7 gallery border rounded-md">
				<button class="h-full w-9 border-r frame hover:bg-primary-foreground" onclick={() => view = "list"} class:bg-primary-foreground={view === "list"}>
					<List class="size-4"/>
				</button>
				<button class="h-full w-9 frame hover:bg-primary-foreground" onclick={() => view = "kanban"} class:bg-primary-foreground={view === "kanban"}>
					<Kanban class="size-4"/>
				</button>
				<button class="h-full w-9 border-l frame hover:bg-primary-foreground" onclick={() => view = "graph"} class:bg-primary-foreground={view === "graph"}>
					<Share2 class="size-3"/>
				</button>
			</div>
		</div>
	</div>
	{#if view === "list"}
		<TaskList groups={groups} labels={data.labels} users={data.users} statuses={data.statuses} bind:draft_task={task.value}/>
	{:else if view === "kanban"}
		<div id="arena" class="p-2 flex gap-4 flex-1">
			{#each groups as [grouper, tasks]}
			{@const status = data.statuses.find(s => s.id === grouper)}
			{@const status_entry = STATES.find(s => s.value === status?.state)}
			{@const Icon = status_entry?.icon}
				<div id="column" class="flex flex-col border w-80 rounded-lg overflow-hidden h-full shadow-2xl">
					<div class="flex items-center px-4 py-2 border-b w-80 bg-primary-foreground">
						<div class="flex items-center gap-3 tactile-text font-medium">
							<Icon class="size-4"/>
							{status?.name}
						</div>
					</div>
					<ul class="p-2 overflow-scroll flex flex-col gap-2">
						{#each tasks as task}
						{@const status = data.statuses.find(s => s.id === task.status.id)}
						{@const status_entry = STATES.find(s => s.value === status?.state)}
							<li class="flex flex-col px-2 py-3 h-24 border shadow-lg rounded-lg bg-primary-foreground">
								<a href={`/tasks/${task.id}`} class="flex flex-col flex-1">
									<div id="header" class="gallery gap-1">
										<Circle value={task.progress}/>
										<span class="text-sm font-medium tactile-text flex-1 truncate">
											{task.title}
										</span>
										<UserAvatar user={data.users.find(u => u.id === task.assignee?.id)}/>
									</div>
									<div class="flex items-end flex-1 overflow-scroll gap-3 px-1">
										{#each task.labels as { id }}
										{@const label = data.labels.find(l => l.id === id)}
											<Label {label}/>
										{/each}
									</div>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	{:else if view === "graph"}
		<SvelteFlow
		{nodes}
		{edges}
		{snapGrid}
		fitView
		on:nodeclick={(event) => console.log('on node click', event.detail.node)}
	>
		<Controls />
		<Background variant={BackgroundVariant.Lines} />
		<MiniMap />
	</SvelteFlow>
	{/if}
</div>
