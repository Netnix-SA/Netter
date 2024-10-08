<script lang="ts">
	import type { PageData } from "./$types";
	import AnyChip from "@/components/AnyChip.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
    import { DotsHorizontal } from "svelte-radix";
	import { page } from "$app/stores";
    import { CLASSES } from "@/utils";
    import Search from "@/components/Search.svelte";
    import DialogSelect from "@/components/DialogSelect.svelte";
    import { removeSlatedFeatureMutation, slateFeatureMutation } from "@/state";
    import { LayoutList } from "lucide-svelte";
    import DatePicker from "@/components/ui/date-picker.svelte";
	import { type DateValue, CalendarDate, DateFormatter, getLocalTimeZone, today } from "@internationalized/date";
    import { patch } from "@/utils";

	let { data }: { data: PageData } = $props();

	let title = $state(data.objective.title);
	let end = $state(data.objective.end && new CalendarDate(data.objective.end.getUTCFullYear(), data.objective.end.getUTCMonth(), data.objective.end.getUTCDate()));
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
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each CLASSES["Objective"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<DropdownMenu.Separator/>
			{/if}
			<DropdownMenu.Item onclick={async () => await action({}, data.objective.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
</header>
<main class="flex p-24 gap-4 flex-1 w-full">
	<div class="column gap-8 flex-1">
		<header class="gallery">
			<div class="column gap-2">
				{#if data.objective.active}
					<span class="green-light text-sm text-white font-medium">Active</span>
				{:else}
					<span class="text-sm text-white font-medium">Inactive</span>
				{/if}
				<input use:patch={{ value: title, action: (e) => console.log(e) }} type="text" class="text-5xl font-semibold tactile-text flex-1" placeholder="Title" bind:value={title}/>
			</div>
		</header>
		<section class="flex-1">
			<textarea class="text-muted-foreground" bind:value={data.objective.description}></textarea>
		</section>
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">Execution status</span>
			<div class="gallery gap-8">
				<div class="column">
					<span class="text-sm text-muted-foreground">Features</span>
					<span class="tactile-text text-2xl font-bold">
						{data.statistics.features.completed} / {data.statistics.features.total}
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Tasks</span>
					<span class="tactile-text text-2xl font-bold">
						{data.statistics.tasks.completion} / {data.statistics.tasks.total}
					</span>
				</div>
			</div>
			<div class="gallery gap-8">
				<div class="column">
					<span class="text-sm text-muted-foreground">Estimated time</span>
					<span class="tactile-text text-2xl font-bold">
						{data.statistics.tasks.time.total} hrs
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Executed</span>
					<span class="tactile-text text-2xl font-bold">
						{data.statistics.tasks.time.executed} hrs
					</span>
				</div>
				<div class="column">
					<span class="text-sm text-muted-foreground">Spent</span>
					<span class="tactile-text text-2xl font-bold">
						{data.statistics.tasks.time.real} hrs
					</span>
				</div>
			</div>	
		</section>
	</div>
	<side class="column gap-8 w-96">
		<section class="column gap-2">
			<span class="text-sm text-muted-foreground">End</span>
			<DatePicker bind:value={end}/>
		</section>
		<section class="column gap-2">
			<div class="gallery">
				<span class="text-muted-foreground text-sm flex-1">
					Slated features
				</span>
				<DialogSelect filter={{ class: "Feature", exclude: data.features.map(f => f.id) }} onselect={(id) => slateFeatureMutation({})({ id: data.objective.id, feature_id: id })}>
					<span class="text-muted-foreground/50 hover:text-primary transition-colors frame text-xs">Add</span>
				</DialogSelect>
			</div>
			{#each data.features as feature}
				<AnyChip id={feature.id} pinned={data.user.pinned} context={{ name: "Slated", actions: [{ label: "Remove slated", icon: LayoutList, action: (ctx, id) => removeSlatedFeatureMutation(ctx)({ id: data.objective.id, feature_id: id }) }] }}/>
			{:else}
				<div class="frame h-24">
					<span class="text-muted-foreground/50 text-sm italic">No slated features</span>
				</div>
			{/each}
		</section>
	</side>
</main>
