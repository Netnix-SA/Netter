<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";
	import { Command, CommandList, CommandEmpty, CommandItem, CommandInput, CommandGroup } from "$lib/components/ui/command";
    import { client } from "@/state";
    import { onMount, tick } from "svelte";
    import { Button } from "./ui/button";
    import { Check, ChevronsUpDown, SparkleIcon, StarsIcon } from "lucide-svelte";
    import { CLASSES, cn, type SelectEntry } from "@/utils";

	let {
		placeholder = "Select an item",
		filter = undefined,
		value = $bindable(),
		onselect,
	}: { placeholder?: string, filter?: { class?: string, exclude?: string[] }, value: string | undefined, onselect?: (p0: string) => void } = $props();

	let open = $state(false);
	let triggerRef = $state<HTMLButtonElement>(null!);
   
	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
    	});
	}

	let search = $state("");
	let results: { id: string, title: string }[] = $state([]);
	let entries: SelectEntry<string>[] = $derived(results.map(r => ({ label: r.title, value: r.id, icon: CLASSES[r.class].icon })));

	let internal: SelectEntry<string> | undefined = $state(undefined);

	async function handleInput(e: Event, { suggest }: { suggest?: string }) {
		let query = { text: search };
		if (filter?.class) query.class = filter.class;
		if (filter?.exclude) query.exclude = filter.exclude;
		if (suggest) query.suggest = suggest;
		const { data } = await client.api.get({ query });
		results = data || [];
	}

	$effect(() => { // Run query on mount and when filter changes
		handleInput(new Event("input"), { suggest: !search ? filter?.class : undefined });
	});

	$inspect(value, entries);
</script>
   
<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button {...props} variant="outline" role="combobox" aria-expanded={open} class="w-full justify-between">
				{entries.find(e => e.value == value)?.label ?? placeholder}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="p-0">
		<Command shouldFilter={false}>
			<CommandInput placeholder="Start typing to search." oninput={async (e) => { search = e.currentTarget.value; }}/>
			<CommandEmpty>No results found.</CommandEmpty>
			<CommandGroup>
				{#each entries as entry(entry.value)}
				{@const Icon = entry.icon}
					<CommandItem value={entry.value} onSelect={() => { internal = entry; value = entry.value; onselect(entry.value); closeAndFocusTrigger(); }}>
						<Check class={cn("size-4", value !== entry.value && "text-transparent" )}/>
						<div class="gallery">
							<Icon class="mr-2 size-4"/>
							<span>
								{entry.label}
							</span>
							{#if false}
								<StarsIcon class="ml-1 size-4"/>
							{/if}
						</div>
					</CommandItem>
				{/each}
			</CommandGroup>
		</Command>
	</Popover.Content>
</Popover.Root>