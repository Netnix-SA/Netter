<script lang="ts">
	import { cn, flyAndScale, type SelectEntry } from "@/utils.ts";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Select from "$lib/components/ui/select";
    import { CheckIcon } from "lucide-svelte";

	let {
		variant = "regular",
		values,
		placeholder = "Select",
		value = $bindable(),
		onSelect = () => {},
	}: { variant?: "regular" | "small" | "icon", placeholder?: string, values: SelectEntry<string>[], value: string | undefined, onSelect: (v: string | undefined) => void } = $props();

	let internal: SelectEntry<string> | undefined = $state(values.find(v => v.value === value));

	$effect(() => {
		value = internal?.value;
	});
</script>

{#snippet text()}
{internal?.label ?? placeholder}
{/snippet}

{#if variant === "regular"}
<Select.Root type="single" loop={true} value={internal?.value}>
	<Select.Trigger>
		{@const Icon = internal?.icon}
		<div class="gallery">
			<Icon class="mr-2 size-4 shrink-0"/>
			<span>
				{@render text()}
			</span>
		</div>
	</Select.Trigger>
	<Select.Content>
		{#each values as entry}
			{@const Icon = entry.icon}
			<Select.Item value={entry.value} label={entry.label} onclick={() => { internal = entry; onSelect(entry.value); }}>
				<Icon class="mr-2 size-4"/>
				{entry.label}
			</Select.Item>
		{/each}
	</Select.Content>
</Select.Root>
{/if}

{#if variant === "icon" || variant === "small"}
{@const Icon = internal?.icon}
<DropdownMenu.Root>
	<DropdownMenu.Trigger class="{variant === "small" ? "gallery gap-1 px-2" : "frame"} bg-primary-foreground rounded-md border {variant === "small" ? "h-6 w-full" : "size-6"}">
		{#if internal}
			<Icon class={variant === "small" ? "size-3" : "size-4"}/>
			{#if variant === "small"}
				<span class="text-sm truncate">
					{@render text()}
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
				<CheckIcon class={cn("size-4", value !== entry.value && "text-transparent" )}/>
				{@const EntryIcon = entry.icon}
				<EntryIcon class="size-4 mr-2"/> {entry.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
{/if}
