<script lang="ts">
	let {
		labels,
		value,
		onSelect = () => {},
		onRemove = () => {},
		onUpdate = () => {},
	}: { labels: Label[], value: string[], onSelect: (v: string) => void, onRemove: (v: string) => void, onUpdate: (v: string[]) => void } = $props();

	let open = $state(false);

	$effect(() => {
		if (labels.length == value.length) {
			open = false;
		}
	});

	import { send, receive, cn, color_to_class } from "$lib/utils.ts";
    import type { Label } from "@/types";
    import { PlusIcon, XIcon } from "lucide-svelte";

	$inspect(labels);
</script>


{#snippet lbl({ title, color, icon })}
<div class="h-full flex items-center justify-center min-w-5 w-5 border-r text-[0.75rem]" class:bg-orange-400={color === 'Orange/Light'} class:bg-red-400={color === 'Red/Light'} class:bg-purple-400={color === 'Purple/Light'} class:bg-green-400={color === 'Green/Light'} style="box-shadow:inset rgba(0, 0, 0, 0.5) 0px 0px 8px">
	{icon}
</div>
<div class="gallery px-2">
	<span class="truncate flex-1 text-[0.75rem] tactile-text">
		{title}
	</span>
</div>
{/snippet}

<div class="gallery gap-4 h-9">
	<div class="relative bg-primary-foreground rounded border items-center">
		<button onclick={() => open = !open} class="size-6 text-sm flex items-center justify-center">
			<PlusIcon class="size-4"/>
		</button>
		<div class={cn("absolute z-10 top-8 left-0 rounded overflow-hidden column transition-all", open ? "h-96 w-32 border shadow-2xl" : "h-0 w-0 blur-md")}>
			{#if open}
			<div class="column shrink-0 bg-primary-foreground gap-2 p-2 h-96 w-32 items-center">
				{#each labels as { id, title, color, icon }(id)}
					<button class={cn("gallery px-2 py-1 rounded-full bg-neutral-950 border text-xs", color_to_class("text", color))} in:receive={{ key: id }} out:send={{ key: id }} onclick={() => { onSelect(id) }}>
						{title}
					</button>
				{:else}
					<span class="text-muted-foreground text-xs text-center">
						{#if labels.length === 0}
							No labels available
						{:else}
							All labels added
						{/if}
					</span>
				{/each}
			</div>
			{/if}
		</div>
	</div>
	<div class="gallery h-6 gap-2">
		{#each labels.filter(l => value.includes(l.id)) as { id, title, color, icon }(id)}
			<div class={cn("gallery px-2 py-1 rounded-full bg-neutral-950 border text-xs", color_to_class("text", color))} in:receive={{ key: id }} out:send={{ key: id }}>
				{title}
				<button class="text-xs tactile-text ml-2" onclick={() => { onRemove(id); }}>
					<XIcon class="size-3.5"/>
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	@keyframes scale-easeOutElastic {
		0% {
			transform: scale(1);
		}

		16% {
			transform: scale(-0.32);
		}

		28% {
			transform: scale(0.13);
		}

		44% {
			transform: scale(-0.05);
		}

		59% {
			transform: scale(0.02);
		}

		73% {
			transform: scale(-0.01);
		}

		88% {
			transform: scale(0);
		}

		100% {
			transform: scale(0);
		}
	}
</style>