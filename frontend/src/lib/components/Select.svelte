<script lang="ts" generics="T">
	import { flyAndScale, type SelectEntry } from "@/utils.ts";

	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	import { Select } from "bits-ui";

	let { variant = "regular", values, placeholder = "Select", comparator, value = $bindable() }: { variant?: "regular" | "small" | "icon", placeholder?: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

	let internal: string | undefined = $state(value !== null ? values.find(v => comparator(v.value, value))?.label : undefined);

	$effect(() => {
		value = internal ? values.find(v => v.label === internal)?.value : null;
	});
</script>

{#if variant === "regular"}
<Select.Root type="single" bind:value={internal} loop={true}>
	<Select.Trigger class="border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring aria-[invalid]:border-destructive data-[placeholder]:[&>span]:text-muted-foreground flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1">
		{#snippet children()}
			{internal ?? placeholder}
		{/snippet}
	</Select.Trigger>
	<Select.Portal>
		<Select.Content align="center" class="bg-popover text-popover-foreground relative z-50 min-w-[8rem] overflow-hidden rounded-md border shadow-md focus:outline-none" forceMount={true}>
			{#snippet child({ props, open })}
				{#if open}
					<div {...props} transition:flyAndScale>
						<Select.Viewport>
							{#each values as entry}
								{@const Icon = entry.icon}
								<Select.Item value={entry.label} label={entry.label} class="data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
									{#snippet children({ selected })}
										<Icon class="mr-2 size-4 shrink-0"/>
										{entry.label}
										{selected ? "✅" : ""}
									{/snippet}
								</Select.Item>
							{/each}
						</Select.Viewport>
					</div>
				{/if}
			{/snippet}
		</Select.Content>
	</Select.Portal>
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
