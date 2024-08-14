<script lang="ts">
	import Check from "lucide-svelte/icons/check";
	import ChevronsUpDown from "lucide-svelte/icons/chevrons-up-down";
	import * as Command from "$lib/components/ui/command";
	import * as Popover from "$lib/components/ui/popover";
	import { Button } from "$lib/components/ui/button";
	import { cn } from "$lib/utils.js";
	import { tick } from "svelte";
   
	type Entry = {
		value: string;
		label: string;
	};

	let { entries, placeholder = "Select an option", onSelect }: { entries: Entry[], placeholder: string, onSelect: (arg0: string) => void } = $props();
   
	let open = $state(false);
	let value = $state("");
   
	let selectedValue = $derived(entries.find((f) => f.value === value)?.label ?? placeholder);
   
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
   
<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
		builders={[builder]}
		variant="outline"
		role="combobox"
		aria-expanded={open}
		class="justify-between"
		>
		{selectedValue}
		<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="p-0">
		<Command.Root>
		<Command.Input {placeholder}/>
		<Command.Empty>No framework found.</Command.Empty>
		<Command.Group>
			{#each entries as entry}
			<Command.Item
				value={entry.value}
				onSelect={(currentValue) => {
					value = currentValue;
					onSelect(currentValue);
					closeAndFocusTrigger(ids.trigger);
				}}
			>
				<Check class={cn("mr-2 h-4 w-4", value !== entry.value && "text-transparent")}/>
				{entry.label}
			</Command.Item>
			{/each}
		</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>