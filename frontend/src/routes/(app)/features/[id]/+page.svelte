<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData } from "./$types";
    import type { Value } from "@/types";
    import Select from "@/components/Select.svelte";
    import { VALUES } from "@/global";
    import AnyChip from "@/components/AnyChip.svelte";
    import { onNavigate } from "$app/navigation";
    import { updateFeatureMutation } from "@/state";

	let { data }: { data: PageData } = $props();

	let feature = $state(data.feature);

	onNavigate(async () => {
		updateFeatureMutation({})(feature);
	});

	$inspect(feature);
</script>

<svelte:head>
	<title>{data.feature.name}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.feature.name}
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md">
		+
	</button>
</header>
<div class="flex-1 w-full flex px-12 py-12">
	<div class="column flex-1 gap-4">
		<input type="text" class="tactile-text text-4xl font-bold" bind:value={feature.name}/>
		<section class="column">
			<span class="text-sm text-muted-foreground">Description</span>
			<textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" bind:value={feature.description}></textarea>
		</section>
		<div class="gallery gap-4">
			<section class="flex flex-col flex-1">
				<span class="text-sm text-muted-foreground">Constraints</span>
				<textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" bind:value={feature.constraints}></textarea>
			</section>
			<section class="flex flex-col flex-1">
				<span class="text-sm text-muted-foreground">Notes</span>
				<textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" bind:value={feature.notes}></textarea>
			</section>
		</div>
		<section>
			<span class="text-sm text-muted-foreground">Files</span>
		</section>
	</div>
	<Separator orientation="vertical" class="mx-4"/>
	<aside class="column w-96 gap-8">
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Execution status</span>
			<div class="gallery gap-8">
				<div class="column">
					<span class="text-sm text-muted-foreground">Tasks</span>
					<span class="tactile-text text-2xl font-bold">
						{data.stats.tasks.completion} / {data.stats.tasks.total}
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Bugs</span>
					<span class="tactile-text text-2xl font-bold">
						{data.stats.bugs.total}
					</span>
				</div>
			</div>
		</section>
		<Separator/>
		<section>
			<!-- <span class="text-sm text-muted-foreground">Value</span> -->
			<Select label="Value" comparator={(a, b) => a === b} values={VALUES} bind:value={feature.value}/>
		</section>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Components</span>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.components as component}
				<AnyChip id={component.id}/>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
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
	</aside>
</div>
