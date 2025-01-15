<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';

	let { data, item, empty }: { data: T[], item: Snippet<[T]>, empty?: Snippet<[]> } = $props();
</script>

{#if data.length > 0}
	<ul>
		{#each data as e}
			<li>{@render item(e)}</li>
		{/each}
	</ul>
{:else}
	<div class="frame size-full">
		{#if empty}
			{@render empty()}
		{:else}
			<p>No items to display</p>
		{/if}
	</div>
{/if}