<script lang="ts" generics="T">
	import type { SelectEntry } from "@/global";

	import * as Select from "$lib/components/ui/select";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	import type { Selected } from "bits-ui";

	let { variant = "regular", label, values, placeholder = "Select", comparator, value = $bindable() }: { variant: "regular" | "small" | "icon", label?: string, placeholder: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

	let internal: Selected<T> | undefined = $state(value !== null ? values.find(v => comparator(v.value, value)) : undefined);

	$effect(() => {
		value = internal?.value || null;
	});
</script>

{#if variant === "regular"}
<Select.Root bind:selected={internal} loop>
	<Select.Trigger name={label} class="min-w-24 flex-1 w-full">
		<Select.Value {placeholder}/>
	</Select.Trigger>
	<Select.Content>
		{#each values as entry}
			{@const Icon = entry.icon}
			<Select.Item value={entry.value}>
				<Icon class="mr-2 size-4 shrink-0"/>
				{entry.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
{/if}

{#if variant === "icon" || variant === "small"}
{@const Icon = values.find(v => v.label === internal?.label)?.icon}
<DropdownMenu.Root>
	<DropdownMenu.Trigger class="{variant === "small" ? "gallery gap-1 px-1" : "frame"} bg-primary-foreground rounded-md border {variant === "small" ? "h-6 w-24" : "size-6"}" title={label}>
		{#if internal}
			<Icon class={variant === "small" ? "size-3" : "size-4"}/>
			{#if variant === "small"}
				<span class="text-sm truncate">
					{internal?.label}
				</span>
			{/if}
		{:else}
			<span class="text-muted-foreground text-sm">
				{placeholder}
			</span>
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each values as entry}
			<DropdownMenu.Item onclick={() => { internal = entry; }}>
				{@const EntryIcon = entry.icon}
				<EntryIcon class="size-4 mr-2"/> {entry.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
{/if}
