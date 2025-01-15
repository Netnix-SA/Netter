<script lang="ts">
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import { blur } from "svelte/transition";
    import Pin from "@/components/Pin.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { DotsHorizontal } from "svelte-radix";
    import { CLASSES } from "@/utils.ts";
    import { client, updateProductMutation } from "@/state";
    import { toast } from "svelte-sonner";
    import { BookOpenTextIcon } from "lucide-svelte";

    let { data }: { data: PageData } = $props();

	let product = $state(data.product);
</script>

<svelte:head>
	<title>{data.product.name}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name}
		</h1>
		{#each CLASSES["Product"].links as { label, url }}
		<a href={`${$page.url}/${label.toLowerCase()}`} class="rounded item-background h-6 min-w-12 px-2 frame">
			<span class="text-xs text-center tactile-text">{label}</span>
		</a>
		{/each}
	</div>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={() => toast.promise(client.api.products({ id: data.product.id }).brief.get().then(e => e.data ?? "NO CONTENT").then(e => navigator.clipboard.writeText(e)), { loading: "Generating product brief...", success: "Copied product brief to clipboard!", error: "Failed to generate product brief." }) }>
				<BookOpenTextIcon class="size-4 mr-2"/> Brief
			</DropdownMenu.Item>
			<DropdownMenu.Separator/>
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
	<main class="flex-1 flex">
		<div class="flex-1 column gap-4 px-16 py-24">
			<input class="text-5xl font-semibold tactile-text border-0" in:blur bind:value={product.name} onblur={async (e) => await updateProductMutation({})(product)}/>
			<textarea class="text-muted-foreground h-full border-0" bind:value={product.description} in:blur={{ delay: 100}} onblur={async (e) => await updateProductMutation({})(product)}>
			</textarea>
		</div>
		<div class="w-96 column gap-4 border-l bg-neutral-950 px-6 py-8">
			<div class="column">
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