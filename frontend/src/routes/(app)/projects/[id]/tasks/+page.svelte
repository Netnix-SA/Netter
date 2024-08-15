<script lang="ts">
	import { STATES } from "@/global";
	import type { PageData } from "./$types";
	import { groupBy } from "@/utils";
    import Label from "@/components/LabelChip.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tabs from "$lib/components/ui/tabs";
	import * as ContextMenu from "$lib/components/ui/context-menu";
    import { Filter, Kanban, List, Share2, X } from "lucide-svelte";

	let { data }: { data: PageData } = $props();

	let groups = $derived(groupBy(data.tasks.filter(t => {
		return filters.every(filter => {
			switch (filter.type) {
				case "State": {
					return data.statuses.find(s => s.id === t.status)?.state === filter.value;
				}
				case "Status": {
					return t.status === filter.value;
				}
				case "Text": {
					return t.title.toLowerCase().includes(filter.value.toLowerCase());
				}
			}
		});
	}), ({ status }) => status));

	import { commands } from "@/state";
    import { onMount } from "svelte";
    import UserSearch from "@/components/UserSearch.svelte";
    import { blur, fade, fly } from "svelte/transition";
    import UserAvatar from "@/components/UserAvatar.svelte";
    import Input from "@/components/ui/input/input.svelte";
    import TaskLine from "@/components/TaskLine.svelte";

	onMount(() => {
		const entry = { name: "Project", commands: [{ name: "Create task", do: () => {} }] };

		commands.update(c => {
			c.push(entry);
			return c;
		});

		return () => {
			commands.update(c => { return c.filter(e => e != entry); });
		};
	});

	let view: "list" | "kanban" | "graph" = $state("list");

	let filters: ({ type: "State" | "Status" | "Text", operator: '=', value: string })[] = $state([]);

	import { writable, type Writable } from 'svelte/store';
	import {
		SvelteFlow,
		Controls,
		Background,
		BackgroundVariant,
		MiniMap,

        type Node,

        type Edge


	} from '@xyflow/svelte';
	
	// 👇 this is important! You need to import the styles for Svelte Flow to work
	import '@xyflow/svelte/dist/style.css';
	
	// We are using writables for the nodes and edges to sync them easily. When a user drags a node for example, Svelte Flow updates its position.
	const nodes: Writable<Node[]> = writable([]);
	
	// same for edges
	const edges: Writable<Edge[]> = writable([]);
	
	$effect(() => {
		const nds = data.tasks.map(task => ({
			id: task.id,
			type: 'default',
			data: { label: task.title },
			position: { x: 0, y: 0 }
		}));

		nodes.set(nds);

		const edgs = data.tasks.map(task => {
			return task.relatives.children.map(child => {
				return {
					id: `${task.id}-${child.id}`,
					source: task.id,
					target: child.id,
					type: 'default'
				};
			});
		}).flat();

		edges.set(edgs);
	});

	const snapGrid: [number, number] = [25, 25];
</script>

<div class="flex-1 w-full flex flex-col">
	<div class="h-10 gallery px-4 border-b">
		<div id="left" class="flex-1 gallery">
			{#each filters as filter, i}
				{#if i > 0}
					<div class="gallery h-full px-1">&</div>
				{/if}
				<div class="gallery border rounded text-xs divide-x h-6 tactile">
					<div class="gallery h-full px-1">{filter.type}</div>
					<div class="gallery h-full px-1 text-sm">{filter.operator}</div>
					<div class="gallery h-full px-1">{filter.value}</div>
					<button class="gallery h-full px-1" onclick={() => { filters = filters.filter(f => f !== filter); }}><X class="w-4 h-4"/></button>
				</div>
			{:else}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<div class="gallery h-6 w-min rounded border border-dashed hover:bg-primary-foreground group transition-all gap-2 px-1">
						<span class="text-xl tactile-text">
							+
						</span>
						<span class="w-0 tactile-text group-hover:w-min text-sm text-clip text-nowrap">
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
									<DropdownMenu.Item onclick={() => filters.push({ type: "State", operator: '=', value: "Backlog" })}>Backlog</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => filters.push({ type: "State", operator: '=', value: "Alive" })}>Active</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => filters.push({ type: "State", operator: '=', value: "Resolved" })}>Closed</DropdownMenu.Item>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>Assignee</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent class="w-fit">
									<UserSearch values={data.users}/>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>Label</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									{#each data.labels as label}
										<DropdownMenu.Item>{label.title}</DropdownMenu.Item>
									{/each}
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>Status</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									{#each data.statuses as status}
										<DropdownMenu.Item onclick={() => filters.push({ type: "Status", operator: '=', value: status.id })}>{status.name}</DropdownMenu.Item>
									{/each}
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
							<DropdownMenu.Sub>
								<DropdownMenu.SubTrigger>Text</DropdownMenu.SubTrigger>
								<DropdownMenu.SubContent>
									<Input onkeydown={(e) => { if (e.key === 'Enter') { filters.push({ type: "Text", operator: '=', value: e.currentTarget.value }); e.currentTarget.blur(); } }}/>
								</DropdownMenu.SubContent>
							</DropdownMenu.Sub>
						</DropdownMenu.Group>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/each}
		</div>
		<div id="right" class="w-96 gallery gap-4">
			<Tabs.Root class="" bind:value={view}>
				<Tabs.List class="p-1 h-8">
				  <Tabs.Trigger value="list"><List class="w-4 h-4"/></Tabs.Trigger>
				  <Tabs.Trigger value="kanban"><Kanban class="w-4 h-4"/></Tabs.Trigger>
				  <Tabs.Trigger value="graph"><Share2 class="w-4 h-4"/></Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
		</div>
	</div>
	{#if view === "list"}
		{#each groups as [grouper, tasks]}
		{@const status = data.statuses.find(s => s.id === grouper)}
		{@const state_entry = STATES.find(s => s.value === status?.state)}
			<div class="bg-primary-foreground flex items-center px-4 py-2 border-y mt-2" in:blur out:fly>
				<div class="flex items-center gap-4 tactile-text">
					<svelte:component this={state_entry?.icon} class="h-4 w-4"/>
					{status?.name}
				</div>
			</div>
			{#each tasks as task}
				<li class="flex items-center border-b h-10 w-full">
					<TaskLine {task} user={data.users.find(u => u.id === task.assignee?.id)}/>
				</li>
			{/each}
		{/each}
	{:else if view === "kanban"}
		<div id="arena" class="p-2 flex gap-4 flex-1">
			{#each groups as [grouper, tasks]}
			{@const status = data.statuses.find(s => s.id === grouper)}
			{@const status_entry = STATES.find(s => s.value === status?.state)}
				<div id="column" class="flex flex-col border w-80 rounded-lg overflow-hidden h-full shadow-2xl">
					<div class="bg-primary-foreground flex items-center px-4 py-2 border-b w-80 header-background">
						<div class="flex items-center gap-4 tactile-text">
							<svelte:component this={status_entry?.icon} class="h-4 w-4"/>
							{status?.name}
						</div>
					</div>
					<ul class="p-2 overflow-scroll flex flex-col gap-2">
						{#each tasks as task}
						{@const status = data.statuses.find(s => s.id === task.status)}
						{@const status_entry = STATES.find(s => s.value === status?.state)}
							<li class="flex flex-col px-4 py-3 h-24 border shadow-lg rounded-lg page-backdrop">
								<a href={`/tasks/${task.id}`} class="flex flex-col flex-1">
									<div id="header" class="gallery gap-2">
										<span class="text-sm tactile-text flex-1 truncate">
											{task.title}
										</span>
										<UserAvatar user={data.users.find(u => u.id === task.assignee?.id)}/>
									</div>
									<div class="flex items-end flex-1">
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