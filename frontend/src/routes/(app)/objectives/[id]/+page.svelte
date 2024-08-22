<script lang="ts">
	import type { PageData } from "./$types";
	import AnyChip from "@/components/AnyChip.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { page } from "$app/stores";
	import { Pin, PinOff } from "lucide-svelte";
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
	<button class="rounded border frame size-6" onclick={async () => await addPinned(data.objective.id)}>
		{#if data.user.pinned.find(p => p === data.objective.id)}
			<PinOff class="text-primary size-4"/>
		{:else}
			<Pin class="text-primary size-4"/>
		{/if}
	</button>
</header>
<main class="flex flex-col p-24 gap-4 flex-1 w-full">
	<header class="gallery">
		<input type="text" class="text-5xl font-semibold tactile-text flex-1" placeholder="Title" bind:value={data.objective.title}/>
		{#if data.objective.active}
			<span class="green-light text-sm text-white font-medium">Active</span>
		{:else}
			<span class="text-sm text-white font-medium">Inactive</span>
		{/if}
	</header>
	<div class="flex">
		<div class="column flex-1 gap-16">
			<section class="column gap-2">
				<p class="text-muted-foreground">{data.objective.description}</p>
			</section>
			<section class="column gap-2">
				<h2 class="text-sm text-muted-foreground">Slated features</h2>
				{#each data.features as feature}
					<AnyChip id={feature.id} pinned={data.user.pinned}/>
				{/each}
			</section>
		</div>
		<side>
			<section class="column gap-2">
				<h2 class="text-sm text-muted-foreground">Completion</h2>
			</section>
		</side>
	</div>
</main>
