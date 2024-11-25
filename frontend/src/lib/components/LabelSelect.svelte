<script lang="ts">
	let options = $state(["A", "B", "C"].map((value) => ({ value, label: value })));
	let chosen = $state([]);

	let open = $state(false);

	$effect(() => {
		if (options.length === 0) {
			open = false;
		}
	});

	import { send, receive, cn } from "$lib/utils.ts";
    import { PlusIcon } from "lucide-svelte";
</script>

<div class="gallery gap-4 h-9">
	<div class="relative bg-primary-foreground rounded border items-center">
		<button onclick={() => open = !open} class="size-6 text-sm flex items-center justify-center">
			<PlusIcon class="size-4"/>
		</button>
		<div class={cn("absolute z-10 top-8 left-0 rounded overflow-hidden column transition-all", open ? "h-32 w-24 border shadow-2xl" : "h-0 w-0 blur-md")}>
			{#if open}
			<div class="column shrink-0 bg-primary-foreground gap-2 p-2 h-32 w-24 items-center">
				{#each options as { label: title }(title)}
					<button class="w-fit max-w-32 h-6 rounded flex items-center bg-slate-950 overflow-hidden item-background" in:receive={{ key: title }} out:send={{ key: title }} onclick={() => { chosen = [...chosen, title]; options = options.filter((option) => option.label !== title); }}>
						<div class="h-full flex items-center justify-center min-w-5 w-5 border-r text-[0.75rem]" class:bg-orange-400={title === 'Orange/Light'} class:bg-red-400={title === 'Red/Light'} class:bg-purple-400={title === 'Purple/Light'} class:bg-green-400={title === 'Green/Light'} style="box-shadow:inset rgba(0, 0, 0, 0.5) 0px 0px 8px">
							<!-- {label?.icon} -->
						</div>
						<div class="gallery px-2">
							<span class="truncate flex-1 text-[0.75rem] tactile-text">
								{title}
							</span>
						</div>
					</button>
				{/each}
			</div>
			{/if}
		</div>
	</div>
	<div class="gallery h-6 gap-2">
		{#each chosen as title(title)}
			<div class="w-fit max-w-32 h-6 flex items-center rounded-md bg-slate-950 overflow-hidden item-background" in:receive={{ key: title }} out:send={{ key: title }}>
				<div class="h-full flex items-center justify-center min-w-5 w-5 border-r text-[0.75rem]" class:bg-orange-400={title === 'Orange/Light'} class:bg-red-400={title === 'Red/Light'} class:bg-purple-400={title === 'Purple/Light'} class:bg-green-400={title === 'Green/Light'} style="box-shadow:inset rgba(0, 0, 0, 0.5) 0px 0px 8px">
					<!-- {label?.icon} -->
				</div>
				<div class="gallery px-2">
					<span class="truncate flex-1 text-[0.75rem] tactile-text">
						{title}
					</span>
				</div>
				<button class="text-xs tactile-text pr-2" onclick={() => { chosen = chosen.filter((option) => option !== title); options.push({ value: title, label: title }); }}>
					x
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