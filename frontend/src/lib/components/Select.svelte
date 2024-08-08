<script lang="ts" generics="T">
    import type { SelectEntry } from "@/global";
    import * as Select from "$lib/components/ui/select";
    import type { Selected } from "bits-ui";

    let { label, values, comparator, value = $bindable() }: { label: string, values: SelectEntry<T>[], comparator: (a: T, b: T) => boolean, value: T | null } = $props();

    let internal: Selected<T> | undefined = $state(value !== null ? values.find(v => comparator(v.value, value)) : undefined);

    $effect(() => {
        value = internal?.value || null;
    });
</script>

<Select.Root bind:selected={internal} loop>
    <Select.Trigger name={label}>
        <Select.Value placeholder="Select"/>
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