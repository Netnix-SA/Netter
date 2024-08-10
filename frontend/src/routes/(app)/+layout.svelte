<script lang="ts">
    import { onMount } from "svelte";
	import "../../app.css";

	import { Settings } from "lucide-svelte";
	import * as Command from "$lib/components/ui/command";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { goto, onNavigate } from "$app/navigation";
	import { Separator } from "$lib/components/ui/separator";
    import { commands } from "@/state";
    import { LINKS } from "@/global";

	const { children } = $props();

	let open = $state(false);

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = !open;
			}
		}

		window.addEventListener('keydown', handleKeydown);

		return () => {
      		document.removeEventListener("keydown", handleKeydown);
    	};
	});

	onNavigate(() => {
		open = false;
	});

	let search = $state("");
	
	let entries: string[] = $state([]);

	async function handleInput(e: Event) {
		let res = await fetch(`/api?text=${search}`);
		let results: string[] = await res.json();
		entries = results;
	}

	async function handleEntry(entry: string) {
		if (entry.startsWith("Project")) {
			await goto(`/projects/${entry}`);
		}

		if (entry.startsWith("Team")) {
			await goto(`/teams/${entry}`);
		}

		if (entry.startsWith("Channel")) {
			await goto(`/channels/${entry}`);
		}

		if (entry.startsWith("Task")) {
			await goto(`/tasks/${entry}`);
		}

		if (entry.startsWith("Task")) {
			await goto(`/products/${entry}`);
		}
	}
</script>

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
				<!-- <Dialog.Root>
					<Dialog.Trigger class="h-4/5 aspect-square border rounded flex items-center justify-center">
					<Tooltip.Root>
						<Tooltip.Trigger>
								<SquareCheckBig class="h-4 w-4"/>
							</Tooltip.Trigger>
							<Tooltip.Content>
								<p>ToDo's</p>
							</Tooltip.Content>
						</Tooltip.Root>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>ToDo's</Dialog.Title>
						</Dialog.Header>
						<div class="flex flex-col divide-y">
							<div>
								a
							</div>
							<div>
								b
							</div>
						</div>
						<Dialog.Footer>
							<Input id="username" value="@peduarte" class="w-full"/>
						</Dialog.Footer>
					</Dialog.Content>
				</Dialog.Root> -->
			</div>
			<div class="flex-1 flex flex-col text-sm">
				<div class="flex-1 flex flex-col gap-1 text-sm">
					{#each LINKS as { href, icon, label }}
						<a {href} class="w-full px-2 py-2 rounded hover:bg-primary-foreground hover:scale-105 transition-all flex gap-2 items-center">
							<svelte:component this={icon} class="h-4 w-4"/>
							<span class="text-muted-foreground">
								{label}
							</span>
						</a>
					{/each}
					<Separator class="my-2"/>
					<span class="pr-2 text-muted-foreground temt-sm font-normal">
						Active
					</span>
				</div>
				<Separator class="my-2"/>
				<a href="/settings" class="w-full px-4 py-2 rounded hover:bg-primary-background transition-colors">
					Settings
				</a>
			</div>
		</nav>
		<div class="flex-1 border rounded-lg h-full flex flex-col gap-2 items-center justify-center overflow-hidden page-backdrop">
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
					<Command.Item class="h-8" onSelect={c.do}>{c.name}</Command.Item>
				{/each}
			</Command.Group>
			<Command.Separator/>
		{/each}
		{#if entries.length > 0}
			<Command.Group heading="Results">
				{#each entries as entry}
					<Command.Item class="h-8" onSelect={async () => await handleEntry(entry)}>{entry}</Command.Item>
				{/each}
			</Command.Group>
			<Command.Separator/>
		{/if}
		<Command.Separator />
		<Command.Group heading="Sections">
			{#each LINKS as link}
				<Command.Item class="h-8" onSelect={async () => await goto(link.href)}><svelte:component this={link.icon} class="mr-2 h-4 w-4"/> {link.label}</Command.Item>
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