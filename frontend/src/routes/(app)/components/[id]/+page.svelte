<script lang="ts">
    import { updateComponentMutation } from "@/state";
	import type { PageData } from "./$types";
    import Select from "@/components/Select.svelte";
    import { COMPONENTS } from "@/utils";

	let { data }: { data: PageData } = $props();
</script>

<header class="gallery px-4 bg-primary-foreground w-full h-10 border-b">
	<h1 class="text-sm">{data.component.name}</h1>
</header>
<main class="flex-1 gallery h-full">
	<div class="h-full flex-1 p-24 column gap-4">
		<div class="column">
			<span class="text-sm text-muted-foreground mb-2">{data.component.type}</span>
			<input type="text" class="text-5xl tactile-text font-semibold border-0 p-0" value={data.component.name} onblur={async (e) => await updateComponentMutation({})({ id: data.component.id, name: e.target.value })}/>
		</div>
		<textarea type="text" class="tactile-text" value={data.component.description}></textarea>
	</div>
	<div class="h-full column w-96 gap-8 border-l bg-neutral-950 px-6 py-8">
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Type</span>
			<Select values={COMPONENTS} value={data.component.type} onSelect={async (e) => await updateComponentMutation({})({ id: data.component.id, type: e })}/>
		</section>
	</div>
</main>
