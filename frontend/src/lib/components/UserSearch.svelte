<script lang="ts" generics="T">
	import Check from "lucide-svelte/icons/check";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import * as Command from "$lib/components/ui/command";
	import * as Popover from "$lib/components/ui/popover";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";
	import { tick } from "svelte";
    import Label from "./ui/label/label.svelte";
   
	let { label, values, searchText = "Search", placeholder = "Select", value = $bindable(null) }: { label: string, values: { id: string, full_name: string }[], searchText: string, placeholder: string, value: { id: string, full_name: string } | null } = $props();
   
	let open = $state(false);
   
	const selectedValue = $derived(values.find((f) => f.id === value?.id)?.full_name);
   
	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Command.Root>
	<Command.Input placeholder={searchText}/>
	<Command.Empty class="text-muted-foreground select-none">No results.</Command.Empty>
	<Command.Group>
	{#each values as entry}
		<Command.Item
		value={entry.id}
		onSelect={(currentValue) => {
			value = values.find(e => e.id === currentValue) || null
		}}
		>
		<Check
			class={cn(
			"mr-2 h-4 w-4",
			value?.id !== entry.id && "text-transparent"
			)}
		/>
		{entry.full_name}
		</Command.Item>
	{/each}
	</Command.Group>
</Command.Root>