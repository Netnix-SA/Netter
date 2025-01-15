<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData } from "./$types";
    import type { Value } from "@/types";
    import Select from "@/components/Select.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { CLASSES, VALUES } from "@/utils.ts";
    import AnyChip from "@/components/AnyChip.svelte";
	import { blur } from "svelte/transition";
    import { onNavigate } from "$app/navigation";
    import { addNeededComponentMutation, addTaskTackledMutation, client, removeNeededComponentMutation, removeTackledMutation, updateFeatureMutation } from "@/state";
    import { task } from "@/global.svelte.ts";
    import { Hammer, TurtleIcon, } from "lucide-svelte";
	import { DotsHorizontal } from "svelte-radix";
    import DialogSelect from "@/components/DialogSelect.svelte";
    import NumberFlow from "@number-flow/svelte";
    import { toast } from "svelte-sonner";

	let { data }: { data: PageData } = $props();

	let feature = $state(data.feature);
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
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			<DropdownMenu.Item onclick={() => toast.promise(client.api.features({ id: data.feature.id }).gherkin.get().then(e => e.data ?? "NO CONTENT").then(e => navigator.clipboard.writeText(e)), { loading: "Generating feature Gherkin...", success: "Copied Gherkin to clipboard!", error: "Failed to generate feature Gherkin." }) }>
				<TurtleIcon class="size-4 mr-2"/> Gherkin
			</DropdownMenu.Item>
			<DropdownMenu.Separator/>
			{#each CLASSES["Feature"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<DropdownMenu.Separator/>
			{/if}
			<DropdownMenu.Item onclick={async () => await action({}, data.feature.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>
<div class="flex-1 w-full flex">
	<div class="column flex-1 gap-4 px-16 py-24">
		<input in:blur type="text" class="tactile-text text-5xl font-semibold border-0" value={feature.name} onblur={async (e) => await updateFeatureMutation({})({ id: data.feature.id, name: e.currentTarget.value })}/>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Description</span>
			<textarea class="flex-1 w-full min-h-[8lh]" value={feature.description} onblur={async (e) => await updateFeatureMutation({})({ id: data.feature.id, description: e.currentTarget.value })}/>
		</section>
		<div class="gallery gap-4">
			<section class="column flex-1 gap-2">
				<span class="text-sm text-muted-foreground">Constraints</span>
				<textarea class="flex-1 w-full min-h-[8lh]" value={feature.constraints} onblur={async (e) => await updateFeatureMutation({})({ id: data.feature.id, constraints: e.currentTarget.value })}/>
			</section>
			<section class="column flex-1 gap-2">
				<span class="text-sm text-muted-foreground">Notes</span>
				<textarea class="flex-1 w-full min-h-[8lh]" value={feature.notes} onblur={async (e) => await updateFeatureMutation({})({ id: data.feature.id, notes: e.currentTarget.value })}/>
			</section>
		</div>
		<section>
			<span class="text-sm text-muted-foreground">Files</span>
		</section>
	</div>
	<side class="column w-96 gap-8 border-l bg-neutral-950 px-6 py-8">
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Execution status</span>
			<div class="gallery gap-8">
				<div class="column">
					<span class="text-sm text-muted-foreground">Tasks</span>
					<span class="tactile-text text-2xl font-bold">
						<NumberFlow value={data.stats.tasks.completion}/> / <NumberFlow value={data.stats.tasks.total}/>
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Bugs</span>
					<span class="tactile-text text-2xl font-bold">
						<NumberFlow value={data.stats.bugs.total}/>
					</span>
				</div>
			</div>
		</section>
		<Separator/>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Value</span>
			<Select values={VALUES} bind:value={feature.value} onSelect={async (e) => await updateFeatureMutation({})({ id: data.feature.id, value: e || "Low" })}/>
		</section>
		<section class="column gap-2 h-44">
			<div class="gallery">
				<span class="text-sm text-muted-foreground flex-1">Components</span>
				<DialogSelect filter={{ class: "Component", exclude: data.components.map(f => f.id) }} onselect={async (id) => await addNeededComponentMutation({})({ id: data.feature.id, component_id: id })}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.components as component(component.id)}
					<AnyChip id={component.id} context={{ name: "Needed by", actions: [{ label: "Remove needed component", icon: Hammer, action: (ctx, id) => removeNeededComponentMutation(ctx)({ id: data.feature.id, component_id: id }) }] }}/>
				{:else}
					<div class="frame h-24">
						<span class="text-muted-foreground/50 text-sm italic">No related components</span>
					</div>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-sm text-muted-foreground flex-1">Bugs</span>
			</div>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.bugs as bug}
					<AnyChip id={bug.id}/>	
				{:else}
					<div class="frame h-24">
						<span class="text-muted-foreground/50 text-sm italic">No related bugs</span>
					</div>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
		</section>
		<section class="column gap-2 h-44">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Tackled by
				</span>
				<div class="gallery gap-1">
					<DialogSelect filter={{ class: "Task", exclude: data.tasks.map(f => f.id) }} onselect={(id) => addTaskTackledMutation({})({ id: id, tackled_id: data.feature.id })}>
						<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
					</DialogSelect>
					<span class="text-muted-foreground/50 frame text-xs">|</span>
					<button onclick={() => task.value = { tackles: [{ id: data.feature.id }] }}>
						<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Create</span>
					</button>
				</div>
			</div>
			<div class="column flex-1 overflow-y-scroll gap-2">
				{#each data.tasks as task}
					<AnyChip id={task.id} context={{ name: "Tackles", actions: [{ label: "Remove tackling", icon: Hammer, action: (ctx, id) => removeTackledMutation(ctx)({ id, tackled_id: data.feature.id }) }] }}/>
				{:else}
					<div class="frame h-24">
						<span class="text-muted-foreground/50 text-sm italic">No tackling tasks</span>
					</div>
				{/each}
			</div>
			<!-- <textarea class="flex-1 w-full px-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea> -->
		</section>
	</side>
</div>
