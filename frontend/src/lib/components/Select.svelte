<script lang="ts" generics="T">
	import type { SelectEntry } from "@/global";

	import * as Select from "$lib/components/ui/select";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	import type { Selected } from "bits-ui";

	let { variant = "regular", label, values, placeholder = "Select", comparator, value = $bindable() }: { variant: "regular" | "icon", label?: string, placeholder: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

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
			<Select.Item value={entry.value}>
				<svelte:component
					this={entry.icon}
					class="mr-2 h-4 w-4 shrink-0"
				/>
				{entry.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
{/if}

{#if variant === "icon"}
{@const icon = values.find(v => v.label === internal?.label)?.icon}
<DropdownMenu.Root>
	<DropdownMenu.Trigger class="size-6 frame bg-primary-foreground rounded-md border" title={label}>
		{#if icon}
			<svelte:component this={icon} class="size-4"/>
		{:else}
			?
		{/if}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		{#each values as entry}
			<DropdownMenu.Item onclick={() => { internal = entry; }}>
				<svelte:component this={entry.icon} class="size-4 mr-2"/> {entry.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
{/if}