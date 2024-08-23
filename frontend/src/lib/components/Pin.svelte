<script lang="ts">
	import { Pin, PinOff } from "lucide-svelte";

	let { id, pinned }: { id: string, pinned: string[] } = $props();
</script>

<button class="rounded border frame size-6" onclick={async () => await addPinned(id)}>
	{#if pinned.find(p => p === id)}
		<PinOff class="text-primary size-4"/>
	{:else}
		<Pin class="text-primary size-4"/>
	{/if}
</button>
