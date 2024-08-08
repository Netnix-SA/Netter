<script lang="ts">
	import { STATES } from "@/global";
	import type { PageData } from "./$types";
	import { groupBy } from "@/utils";
    import Label from "@/components/LabelChip.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Tabs from "$lib/components/ui/tabs";
    import { Filter, Kanban, List, X } from "lucide-svelte";

	let { data }: { data: PageData } = $props();

	let groups = $derived(groupBy(data.tasks.filter(t => {
		return filters.every(filter => {
			switch (filter.type) {
				case "State": {
					return data.statuses.find(s => s.id === t.status)?.state === filter.value;
				}
			}
		});
	}), ({ status }) => status));

	import { commands } from "@/state";
    import { onMount } from "svelte";
    import UserSearch from "@/components/UserSearch.svelte";
    import { blur, fade, fly } from "svelte/transition";
    import UserAvatar from "@/components/UserAvatar.svelte";

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

	let view: "list" | "kanban" = $state("list");

	let filters: ({ type: "State", operator: '=', value: string })[] = $state([]);
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
			{/each}
		</div>
		<div id="right" class="w-96 gallery gap-4">
			<Tabs.Root class="" bind:value={view}>
				<Tabs.List class="p-1 h-8">
				  <Tabs.Trigger value="list"><List class="w-4 h-4"/></Tabs.Trigger>
				  <Tabs.Trigger value="kanban"><Kanban class="w-4 h-4"/></Tabs.Trigger>
				</Tabs.List>
			</Tabs.Root>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger><Filter class="w-4 h-4"/></DropdownMenu.Trigger>
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
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
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
				<li class="flex items-center px-6 py-2 border-b">
					<a href={`/tasks/${task.id}`} class="flex items-center flex-1">
						<span class="text-sm hover:light">
							{task.title}
						</span>
					</a>
					<div class="gallery gap-2">
						<div class="gallery">
							<UserAvatar full_name={data.users.find(u => u.id === task.assignee?.id)?.full_name}/>
						</div>
						<div class="gallery">
							{#each task.labels as { id }}
							{@const label = data.labels.find(l => l.id === id)}
							<Label {label}/>
							{/each}
						</div>
					</div>
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
						<div class="flex items-center gap-4">
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
										<svelte:component this={status_entry?.icon} class="h-4 w-4"/>
										<span class="text-sm hover:light flex-1 truncate">
											{task.title}
										</span>
										<UserAvatar full_name="Facundo Villa"/>
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
	{/if}
</div>