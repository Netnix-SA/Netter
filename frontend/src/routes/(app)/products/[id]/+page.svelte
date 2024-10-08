<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import { blur } from "svelte/transition";
    import Pin from "@/components/Pin.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { DotsHorizontal } from "svelte-radix";
    import { CLASSES } from "@/utils.ts";
    import { onNavigate } from "$app/navigation";
    import { updateProductMutation } from "@/state";

    let { data }: { data: PageData } = $props();

	let product = $state(data.product);

	onNavigate(async () => {
		await updateProductMutation({})(product);
	});
</script>

<svelte:head>
	<title>{data.product.name}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name}
		</h1>
		<div class="rounded item-background h-6 min-w-12 px-2 frame">
			<a href={`${$page.url}/features`} class="text-xs text-center tactile-text">Features</a>
		</div>
	</div>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each CLASSES["Product"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<DropdownMenu.Separator/>
			{/if}
			<DropdownMenu.Item onclick={async () => await action({}, data.product.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>
<div class="flex-1 flex flex-col w-full divide-y">
	<main class="flex-1 flex p-24">
		<div class="flex-1">
			<input class="text-5xl font-semibold bg-gradient-to-b from-popover-foreground to-muted-foreground bg-clip-text text-transparent" transition:blur bind:value={product.name}/>
			<textarea class="text-muted-foreground h-[8lh]" bind:value={product.description}>
			</textarea>
		</div>
		<div class="column gap-4">
			<div class="w-96 column">
				<span class="text-sm text-muted-foreground">Applications</span>
				{#await data.applications}
					Loading applications...
				{:then applications}
					{#each applications as application}
						<div class="flex flex-col gap-1 mt-2 px-2">
							<div class="gallery gap-2">
								<a href={`/applications/${application.id}`} class="tactile-text font-semibold text-xl">{application.name}</a>
							</div>
							<p class="text-muted-foreground text-xs line-clamp-2 whitespace-pre-wrap">{application.description}</p>
						</div>
					{/each}
				{/await}
			</div>
			<div class="w-96">
				<span class="text-sm text-muted-foreground font-regular">Projects</span>
				{#each [{ title: "All is well", body: "Project is going great and on time. Thank you everyone!" }] as update}
					<div class="flex flex-col gap-1 mt-2">
						<div class="gallery gap-2">
							<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">👍</span>
							<a href="/projects" class="tactile-text">{update.title}</a>
						</div>
						<p class="text-muted-foreground text-xs whitespace-pre-wrap">{update.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>