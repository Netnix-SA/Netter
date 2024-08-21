<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
import type { PageData } from "./$types";
	import AnyChip from "@/components/AnyChip.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { page } from "$app/stores";
	import { Pin } from "lucide-svelte";
	import { addPinned } from "@/actions";

	let { data }: { data: PageData } = $props();
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.objective.title}
		</h1>
		<div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div>
	</div>
	<button class="rounded border frame size-6" onclick={async () => await addPinned(data.objective.id)}><Pin class="text-primary size-4"/></button>
</header>
<main class="flex flex-col p-24 gap-4 flex-1 w-full">
	<header class="gallery">
		<input type="text" class="text-4xl font-bold tactile-text flex-1" placeholder="Title" bind:value={data.objective.title}/>
		<Button variant="link" href={`${$page.url}/tasks`}>Tasks</Button>
	</header>
	<Separator/>
	<section class="column gap-2">
		<h2 class="text-sm text-muted-foreground">Description</h2>
		<p class="text-lg tactile-text">{data.objective.description}</p>
	</section>
	<section class="column gap-2">
		<h2 class="text-2xl font-semibold tactile-text">Features</h2>
		{#each data.features as feature}
			<AnyChip id={feature.id}/>
		{/each}
	</section>
</main>