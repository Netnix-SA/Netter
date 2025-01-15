<script lang="ts" generics="T">
    import { Loader2Icon } from "lucide-svelte";
    import type { Snippet } from "svelte";
    import { fade } from "svelte/transition";

	let { promise, children }: { promise: Promise<T>, children: Snippet<[T]> } = $props();
</script>

{#await promise}
	<div class="size-full frame" transition:fade>
		<Loader2Icon class="size-8 animate-spin text-muted-foreground"/>
	</div>
{:then data}
	{@render children(data)}
{/await}