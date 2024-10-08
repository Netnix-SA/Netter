<script lang="ts" generics="T">
	import type { SelectEntry } from "@/utils.ts";

	import * as Select from "$lib/components/ui/select";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	import { Select as BitsSelect } from "bits-ui";

	let { variant = "regular", values, placeholder = "Select", comparator, value = $bindable() }: { variant?: "regular" | "small" | "icon", placeholder?: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

	let internal: string | undefined = $state(value !== null ? values.find(v => comparator(v.value, value))?.label : undefined);

	$effect(() => {
		value = internal ? values.find(v => v.label === internal)?.value : null;
	});
</script>

{#if variant === "regular"}
<Select.Root bind:value={internal}>
	<Select.Trigger class="w-full">
		<Select.Value {placeholder}/>
	</Select.Trigger>
	<BitsSelect.Portal>
		<Select.Content position="item-aligned">
			<BitsSelect.Viewport>
				{#each values as entry}
					{@const Icon = entry.icon}
					<Select.Item value={entry.label}>
						<Icon class="mr-2 size-4 shrink-0"/>
						<BitsSelect.ItemText>
							{entry.label}
						</BitsSelect.ItemText>
					</Select.Item>
				{/each}
			</BitsSelect.Viewport>
		</Select.Content>
	</BitsSelect.Portal>
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
