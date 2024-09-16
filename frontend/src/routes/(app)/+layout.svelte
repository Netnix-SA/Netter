<script lang="ts">
    import { onMount, type Snippet } from "svelte";

	import { Settings, Star, SquareCheckBig } from "lucide-svelte";
	import { Toaster } from "$lib/components/ui/sonner";
	import * as Command from "$lib/components/ui/command";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as Tooltip from "$lib/components/ui/tooltip";
    import { goto, onNavigate } from "$app/navigation";
	import { Separator } from "$lib/components/ui/separator";
    import { client, commands, createTaskMutation, createToDoMutation, } from "@/state";
    import { EFFORTS, LINKS, PRIORITIES, STATES, VALUES } from "@/global";
    import type { LayoutData } from "./$types";
    import AnyChip from "@/components/AnyChip.svelte";
    import LabelChip from "@/components/LabelChip.svelte";
    import { toast } from "svelte-sonner";
    import { task, todo } from "@/all.svelte";
    import { Button } from "@/components/ui/button";
    import Select from "@/components/Select.svelte";
    import Search from "@/components/Search.svelte";

	let { data, children }: { data: LayoutData, children: Snippet<[]> } = $props();

	let open = $state(false);

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		window.addEventListener('keydown', handleKeydown);

		const ws = client.api.ws.subscribe();

		ws.subscribe((message) => {
			toast(JSON.stringify(message));
		});

		task.status = data.statuses[0];

		return () => {
      		document.removeEventListener("keydown", handleKeydown);
    	};
	});

	onNavigate(() => {
		open = false;
	});

	commands.subscribe((v) => {
		for (const g of v) {
			for (const c of g.commands) {
				window.addEventListener('keydown', async (e) => {
					if (e.key === c.key) {
						e.preventDefault();
						await c.do();
					}
				});
			}
		}
	});

	let search = $state("");

	let entries: { id: string, title: string }[] = $state([]);

	async function handleInput(e: Event) {
		const { data } = await client.api.get({ query: { text: search } });
		entries = data;
	}

	function handleEntry(entry: string) {
		if (entry.startsWith("Project")) {
			return goto(`/projects/${entry}`);
		}

		if (entry.startsWith("Team")) {
			return goto(`/teams/${entry}`);
		}

		if (entry.startsWith("Channel")) {
			return goto(`/channels/${entry}`);
		}

		if (entry.startsWith("Task")) {
			return goto(`/tasks/${entry}`);
		}

		if (entry.startsWith("Product")) {
			return goto(`/products/${entry}`);
		}
	}

	$effect(() => {
		if (task.value !== null) {
			task.value.priority = task.value.priority ?? PRIORITIES[0].value;
			task.value.effort = task.value.effort ?? EFFORTS[0].value;
			task.value.value = task.value.value ?? VALUES[0].value;
			task.value.status = task.value.status ?? data.statuses[0];
		}
	});
</script>

<Toaster/>
<main class="h-screen w-screen flex flex-col bg-background">
	<div class="w-full h-full flex p-2 gap-4">
		<nav class="border rounded-lg w-72 px-4 pb-4 pt-4 h-full flex flex-col gap-4 page-backdrop">
			<div id="header" class="flex w-full px-1 h-8 items-center">
				<div class="h-full flex-1 flex items-center gap-2">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="rounded border bg-green-500 aspect-square h-full flex items-center justify-center text-sm font-bold tracking-wide">
							FV
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
						  <DropdownMenu.Group>
							<DropdownMenu.Label>My Account</DropdownMenu.Label>
							<DropdownMenu.Separator />
							<DropdownMenu.Item>Profile</DropdownMenu.Item>
							<DropdownMenu.Item>Billing</DropdownMenu.Item>
							<DropdownMenu.Item>Team</DropdownMenu.Item>
							<DropdownMenu.Item>Subscription</DropdownMenu.Item>
						  </DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<Tooltip.Root>
					<Tooltip.Trigger asChild let:builder>
						<Button builders={[builder]} variant="outline" size="icon" onclick={() => todo.value = {}}>
							<SquareCheckBig class="size-4"/>
						</Button>
					</Tooltip.Trigger>
					<Tooltip.Content>Create ToDo</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="flex-1 flex flex-col text-sm gap-4">
				<section class="column gap-1">
					{#each LINKS as { href, icon: Icon, label }}
						<a {href} class="w-full px-2 py-2 rounded hover:bg-primary-foreground hover:scale-105 transition-all flex gap-2 items-center">
							<Icon class="h-4 w-4"/>
							<span class="text-muted-foreground">
								{label}
							</span>
						</a>
					{/each}
				</section>
				<div class="flex-1">
					<section class="column gap-2 flex-1 max-h-64">
						<span class="pr-2 text-muted-foreground text-sm">
							Pinned
						</span>
						<div class="column flex-1 gap-2 overflow-scroll">
							{#each data.user.pinned as pinned(Math.random())}
								<AnyChip id={pinned} pinned={data.user.pinned}/>
							{/each}
						</div>
					</section>
				</div>
				<a href="/settings" class="w-full px-2 py-2 rounded text-muted-foreground hover:text-primary transition-colors">
					Settings
				</a>
			</div>
		</nav>
		<div class="flex-1 border rounded-lg h-full flex flex-col overflow-hidden page-backdrop">
			{@render children()}
		</div>
	</div>
</main>

<Command.Dialog bind:open loop>
	<Command.Input bind:value={search} oninput={handleInput} placeholder="Type a command or search..." />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		{#each $commands as cg}
			<Command.Group heading={cg.name}>
				{#each cg.commands as c}
					<Command.Item class="h-8" onSelect={c.do}>
						{c.name}
						{#if c.key}
							<Command.Shortcut>{c.key}</Command.Shortcut>
						{/if}
					</Command.Item>
				{/each}
			</Command.Group>
			<Command.Separator/>
		{/each}
		{#if entries.length > 0}
		{#key search}
			<Command.Group heading="Results">
				{#each entries as { id, title }(id)}
					<Command.Item class="h-8" onSelect={async () => await handleEntry(id)}>{title}</Command.Item>
				{/each}
			</Command.Group>
			<Command.Separator/>
		{/key}
		{/if}
		<Command.Separator />
		<Command.Group heading="Sections">
			{#each LINKS as { icon: Icon, label, href }}
				<Command.Item class="h-8" onSelect={async () => await goto(href)}><Icon class="mr-2 size-4"/> {label}</Command.Item>
			{/each}
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Settings">
			<Command.Item class="h-8">Profile</Command.Item>
			<Command.Item class="h-8">Billing</Command.Item>
			<Command.Item class="h-8" onSelect={async () => await goto("/settings")}><Settings class="mr-2 h-4 w-4"/>Settings</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>

<Dialog.Root open={todo.value !== null} onOpenChange={(o) => { if (o) { todo.value = {} } else { todo.value = null; }}}>
	<Dialog.Content>
		{#if todo.value !== null}
		<Dialog.Header>
			<Dialog.Title>Create ToDo</Dialog.Title>
		</Dialog.Header>
		<div class="gallery gap-2 h-10">
			<input type="text" placeholder="Tag" class="px-2 py-1 w-20 border text-sm h-full"/>
			<input type="text" placeholder="Title" class="px-2 py-1 flex-1 border text-sm h-full" oninput={(e) => todo.value.title = e.currentTarget.value}/> <!-- todo is not null because of onOpenChange -->
		</div>
		<section class="column gap-1">
			<label class="text-muted-foreground text-sm">Related to</label>
			<Search />
		</section>
		<Dialog.Footer>
			<Button onclick={async () => await createToDoMutation({})({ title: todo.value?.title ?? "" })}>Create</Button>
		</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root open={task.value !== null} onOpenChange={(o) => { if (!o) { task.value = null; }}}>
	<Dialog.Content>
		{#if task.value !== null}
		<Dialog.Header>
			<Dialog.Title class="gallery gap-2">
				Create task
				<span class="text-muted-foreground text-sm font-normal">{task.project}</span>
			</Dialog.Title>
		</Dialog.Header>
		<input type="text" placeholder="Title" class="text-2xl tactile-text" bind:value={task.value.title}/>
		<div class="gallery w-full gap-3">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame border border-dashed text-md hover:text-xl transition-all bg-primary-foreground rounded-md" title="Add label">
					+
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each data.labels.filter(l => !task.value.labels.some(tl => tl.id === l.id)) as label}
						<DropdownMenu.Item class="gallery gap-2" onclick={() => { task.value.labels.push({ id: label.id }); }}>
							{label.icon} {label.title}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<div class="gallery gap-3 overflow-scroll w-full">
				{#each task.value.labels.filter(l => l.id) as { id }}
					{@const label = data.labels.find((l) => l.id === id)}
					<LabelChip {label} />
				{/each}
			</div>
		</div>
		<textarea class="bg-transparent text-sm min-h-[2lh]" placeholder="Description" bind:value={task.value.body}>
		</textarea>
		<div class="w-full flex flex-wrap gap-2">
			<Search filter={{ class: "User" }} bind:value={task.value.assignee}/>
			<Select variant="small" placeholder="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} bind:value={task.value.status}/>
			<Select variant="small" placeholder="Priority" comparator={(a, b) => a === b}     values={PRIORITIES} bind:value={task.value.priority}/>
			<Select variant="small" placeholder="Effort" comparator={(a, b) => a === b}       values={EFFORTS} bind:value={task.value.effort}/>
			<Select variant="small" placeholder="Value" comparator={(a, b) => a === b}        values={VALUES} bind:value={task.value.value}/>
		</div>
		<section class="column gap-1">
			<span class="text-muted-foreground text-sm">Related</span>
			<div class="column gap-1 max-h-16 overflow-scroll">
				{#each task.value.related as related}
					<AnyChip id={related.id} pinned={data.user.pinned}/>
				{:else}
					<div class="frame h-10">
						<span class="text-muted-foreground/50 text-sm italic">No related tasks</span>
					</div>
				{/each}
			</div>
		</section>
		<section class="column gap-1">
			<span class="text-muted-foreground text-sm">Tackles</span>
			<div class="column gap-1 max-h-16 overflow-scroll">
				{#each task.value.tackles as tackled}
					<AnyChip id={tackled.id} pinned={data.user.pinned}/>
				{:else}
					<div class="frame h-10">
						<span class="text-muted-foreground/50 text-sm italic">No tackled elements</span>
					</div>
				{/each}
			</div>
		</section>
		<section class="column gap-1">
			<span class="text-muted-foreground text-sm">Children</span>
			<div class="column gap-1 max-h-16 overflow-scroll">
				{#each task.value.children as child}
					<AnyChip id={child.id} pinned={data.user.pinned}/>
				{:else}
					<div class="frame h-10">
						<span class="text-muted-foreground/50 text-sm italic">No children</span>
					</div>
				{/each}
			</div>
		</section>
		<Dialog.Footer>
			<Button onclick={async () => await createTaskMutation({})()}>Create</Button>
		</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>