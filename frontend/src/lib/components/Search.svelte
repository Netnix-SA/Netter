<script lang="ts">
	import * as Popover from "$lib/components/ui/popover";
	import { Command, CommandList, CommandEmpty, CommandItem, CommandInput, CommandGroup } from "$lib/components/ui/command";
    import { client } from "@/state";
    import { tick } from "svelte";
    import { Button } from "./ui/button";
    import { Check, ChevronsUpDown } from "lucide-svelte";
    import { cn } from "@/utils";

	let open = $state(false);
   
	let selectedEntry: { label: string, value: string } | undefined = $state(undefined);
   
	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	let search = $state("");
	let results: { id: string, title: string }[] = $state([]);
	let entries: { label: string, value: string }[] = $derived(results.map(r => ({ label: r.title, value: r.id })));

	async function handleInput(e: Event) {
		const { data } = await client.api.get({ query: { text: search } });
		results = data || [];
	}
</script>
   
<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button builders={[builder]} variant="outline" role="combobox" aria-expanded={open} class="w-[200px] justify-between">
			{selectedEntry?.label || "Select an item"}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command>
			<CommandInput placeholder="Start typing to search." oninput={async (e) => { search = e.currentTarget.value; await handleInput(e) }}/>
			<CommandEmpty>No results found.</CommandEmpty>
			<CommandGroup>
				{#each entries as entry(entry.value)}
					<CommandItem value={entry.value} onSelect={() => { selectedEntry = entry; closeAndFocusTrigger(ids.trigger); }}>
						<Check class={cn("mr-2 h-4 w-4", selectedEntry?.value !== entry.value && "text-transparent" )}/>
						{entry.label}
					</CommandItem>
				{/each}
			</CommandGroup>
		</Command>
	</Popover.Content>
</Popover.Root>