<script lang="ts" generics="T">
	import { flyAndScale, type SelectEntry } from "@/utils.ts";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Select from "$lib/components/ui/select";

	let { variant = "regular", values, placeholder = "Select", comparator, value = $bindable() }: { variant?: "regular" | "small" | "icon", placeholder?: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

	let internal: string | undefined = $state(value !== null ? values.find(v => comparator(v.value, value))?.label : undefined);

	$effect(() => {
		value = internal ? values.find(v => v.label === internal)?.value : null;
	});
</script>

{#if variant === "regular"}
<Select.Root type="single" bind:value={internal} loop={true}>
	<Select.Trigger>
		{#snippet children()}
			{internal ?? placeholder}
		{/snippet}
	</Select.Trigger>
	<Select.Content align="center">
		{#each values as entry}
			{@const Icon = entry.icon}
			<Select.Item value={entry.label} label={entry.label}>
				{#snippet children({ selected })}
					<Icon class="mr-2 size-4 shrink-0"/>
					{entry.label}
				{/snippet}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
{/if}

{#if variant === "icon" || variant === "small"}
{@const Icon = values.find(v => v.label === internal)?.icon}
<DropdownMenu.Root>
	<DropdownMenu.Trigger class="{variant === "small" ? "gallery gap-1 px-2" : "frame"} bg-primary-foreground rounded-md border {variant === "small" ? "h-6 w-full" : "size-6"}">
		{#if internal}
			<Icon class={variant === "small" ? "size-3" : "size-4"}/>
			{#if variant === "small"}
				<span class="text-sm truncate">
					{internal}
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
			<DropdownMenu.Item onclick={() => { internal = entry.label; }}>
				{@const EntryIcon = entry.icon}
				<EntryIcon class="size-4 mr-2"/> {entry.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
{/if}
