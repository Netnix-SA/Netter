<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData } from "./$types";
    import { Button } from "@/components/ui/button";
    import AnyChip from "@/components/AnyChip.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="w-full flex-1 frame gap-8 px-12 py-12">
	<div class="flex flex-col gap-8">
		<div id="header" class="">
			<input class="appearance-none tactile-text text-4xl font-medium outline-none" bind:value={data.application.name}/>
		</div>
		<Separator/>
		<div id="description" class="flex-1 flex flex-col gap-1">
			<span class="text-muted-foreground">Description</span>
			<textarea class="appearance-none tactile-text w-full h-[8lh] outline-none" bind:value={data.application.description}/>
		</div>
	</div>
	<Separator orientation="vertical"/>
	<div class="column">
		<div id="bugs">
			<h2 class="text-muted-foreground mb-2">Bugs</h2>
			{#await data.bugs}
				<span class="animate-pulse">
					Loading bugs...
				</span>
			{:then bugs}
				<ul class="flex flex-col h-96 w-96 overflow-scroll border-2 border-neutral-800 rounded-lg" style="box-shadow: 0 2px 16px rgba(0,0,0,0.4);">
					{#each bugs as bug}
					<li class="gallery text-sm tactile-text h-10 border-b px-6">
						<a href={`/bugs/${bug.id}`}>{bug.title}</a>
					</li>
					{/each}
				</ul>
			{/await}
		</div>
		<Separator class="my-4"/>
		<div id="repository">
			<h2 class="text-muted-foreground mb-2">Repository</h2>
			{#if data.application.repository}
				<AnyChip id={data.application.repository.id}/>
			{:else}
				<div class="frame flex-col gap-2 border border-dashed rounded-lg h-32">
					<span class="text-muted-foreground text-sm italic">No repository linked</span>
					<Button>
						Link repository
					</Button>
				</div>
			{/if}
		</div>
	</div>
</div>