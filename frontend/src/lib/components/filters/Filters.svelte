<script lang="ts">
    import type { AssigneeFilter, LabelFilter, StateFilter, StatusFilter, TextFilter } from "@/types";
    import { X } from "lucide-svelte";

	let { filters = $bindable() }: { filters: ((StatusFilter | StateFilter | TextFilter | LabelFilter | AssigneeFilter) & { display: string })[] } = $props();
</script>

{#each filters as filter, i}
	{#if i > 0}
		<div class="gallery h-full px-1">&</div>
	{/if}
	<div class="gallery rounded-md text-sm divide-x h-6 item-background">
		<div class="gallery h-full px-1 tactile-text">{filter.type}</div>
		<div class="gallery h-full px-1 tactile-text">{filter.operation}</div>
		<div class="gallery h-full px-1 tactile-text">{filter.display}</div>
		<button class="gallery h-full px-1" onclick={() => { filters = filters.filter(f => f !== filter); }}><X class="w-4 h-4"/></button>
	</div>
{/each}