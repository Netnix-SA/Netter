<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData } from "./$types";
    import type { Value } from "@/types";
    import Select from "@/components/Select.svelte";
    import { VALUES } from "@/global";
    import AnyChip from "@/components/AnyChip.svelte";

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.feature.name}</title>
</svelte:head>

<div class="flex-1 w-full flex px-12 py-12">
	<div class="column flex-1 gap-4">
		<input type="text" class="tactile-text text-4xl font-bold" bind:value={data.feature.name}/>
		<section class="column">
			<span class="text-sm text-muted-foreground">Description</span>
			<textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea>
		</section>
		<div class="gallery gap-4">
			<section class="flex flex-col flex-1">
				<span class="text-sm text-muted-foreground">Acceptance criteria</span>
				<textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea>
			</section>
			<section class="flex flex-col flex-1">
				<span class="text-sm text-muted-foreground">Notes</span>
				<textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea>
			</section>
		</div>
		<section>
			<span class="text-sm text-muted-foreground">Files</span>
		</section>
	</div>
	<Separator orientation="vertical" class="mx-4"/>
	<div class="column w-96 gap-8">
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Execution status</span>
			<div class="gallery gap-8">
				<div class="column">
					<span class="text-sm text-muted-foreground">Tasks</span>
					<span class="tactile-text text-2xl font-bold">
						{data.tasks.length} / {data.tasks.length}
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Bugs</span>
					<span class="tactile-text text-2xl font-bold">
						{data.bugs.length}
					</span>
				</div>
			</div>
		</section>
		<Separator/>
		<section>
			<!-- <span class="text-sm text-muted-foreground">Value</span> -->
			<Select label="Value" comparator={(a, b) => a === b} values={VALUES} bind:value={data.feature.value}/>
		</section>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Bugs</span>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.bugs as bug}
					<AnyChip id={bug.id}/>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
		</section>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Tackled by</span>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.tasks as task}
				<AnyChip id={task.id}/>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
		</section>
	</div>
</div>