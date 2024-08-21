<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData, } from "./$types";
    import { page } from "$app/stores";
	import * as Sheet from "$lib/components/ui/sheet";
	import * as Dialog from "$lib/components/ui/dialog";
	import { blur } from 'svelte/transition';
    import { CalendarArrowUp, Check, Clock9, Star } from "lucide-svelte";
    import UserSelect from "@/components/UserSelect.svelte";
    import { STATES } from "@/global";
    import Select from "@/components/Select.svelte";
    import { Button } from "@/components/ui/button";

	const { data }: { data: PageData } = $props();
	const project = $derived(data.project);

	let lead = $state(data.users.find(u => u.id === data.project.lead?.id) || null);
</script>

<svelte:head>
	<title>{project.name}</title>
</svelte:head>

<header class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground border-b">
	<div class="gallery flex-1 gap-4">
		{project.name}
		<div class="gallery gap-2">
			<div class="rounded item-background h-6 w-12 frame">
				<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
			</div>
			<div class="rounded item-background h-6 w-fit px-2 frame">
				<a href={`${$page.url}/applications`} class="text-xs text-center tactile-text">Applications</a>
			</div>
		</div>
	</div>
</header>

<div class="flex-1 flex flex-col w-full">
	<main class="flex-1 flex items-center justify-center page-backdrop px-48 py-32">
		<div class="flex flex-1 h-full">
			<div class="flex-1 column gap-4">
				<h1 class="text-5xl font-semibold bg-gradient-to-b from-popover-foreground to-muted-foreground bg-clip-text text-transparent" in:blur>{project.name}</h1>
				<section id="description" class="flex-1">
					<p class="text-muted-foreground h-[8lh]">
						{project.description}
					</p>
				</section>
				<Separator class="my-4"/>
				<section id="milestones" class="h-fit">
					<span class="text-sm text-muted-foreground font-regular">Milestones</span>
					{#snippet milestone_snippet({ i, name, description, status }: { i: number, name: string, description: string, status: "done" | "current" | "upcoming" })}
						<div class="flex flex-col h-24 w-56 p-2 gap-2" in:blur={{ delay: i * 100 }}>
							<div class="flex items-center justify-between w-full">
								<span class="tactile-text">
									{name}
								</span>
								{#if status === "done"}
								<Check class="h-4 w-4" style="filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 2px rgba(0, 255, 163, 1));"/>
								{:else if status === "current"}
								<Clock9 class="h-4 w-4" style="filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 2px rgba(0, 255, 163, 1));"/>
								{:else if status === "upcoming"}
								<CalendarArrowUp class="h-4 w-4" style="filter: drop-shadow(0px 0px 12px rgba(220, 180, 0, 1)) drop-shadow(0px 0px 6px rgba(220, 180, 0, 1));"/>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground flex-1 truncate whitespace-pre-wrap">
								{description}
							</p>
						</div>
					{/snippet}
					<Sheet.Root>
						<Sheet.Trigger><span class="text-[0.6rem] text-muted-foreground font-regular">{"See all"}</span></Sheet.Trigger>
						<Sheet.Content>
						<Sheet.Header>
							<Sheet.Title>Milestones</Sheet.Title>
							<Sheet.Description>
								{#each project.milestones as { title, description }, i}
									{@render milestone_snippet({ i, name: title, description, status: "done" })}
								{/each}
							</Sheet.Description>
						</Sheet.Header>
						</Sheet.Content>
					</Sheet.Root>
					<div class="flex">
						{#each project.milestones.slice(0, 3) as milestone, i}
							{#if i > 0}
								<Separator orientation="vertical" class="mx-4"/>
							{/if}
							{@render milestone_snippet({ i, name: milestone.title, description: milestone.description, status: "done" })}
						{/each}
					</div>
				</section>
			</div>
			<Separator orientation="vertical" class="mx-4"/>
			<div class="w-80">
				<UserSelect label="Lead" values={data.users} bind:value={lead}/>
				<Separator class="my-4"/>
				<Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} value={data.project.status}/>
				<Separator class="my-4"/>
				<div class="gallery">
					<span class="text-sm text-muted-foreground font-regular flex-1">Objectives</span>
					<Dialog.Root>
						<Dialog.Trigger>
							<span class="text-[0.7rem] text-muted-foreground font-regular hover:green-light hover:text-white transition-all">{"New objective"}</span>
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>Create objective</Dialog.Header>
							<div class="flex flex-col gap-2">
								<div class="gallery">
									<input type="text" placeholder="Icon" class="border size-8 text-center" value="🥳"/>
									<input type="text" placeholder="Title" class=""/>
								</div>
								<textarea placeholder="Description" class="border"/>
							</div>
							<Dialog.Footer>
								<Button>Create</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>
				</div>
				{#each data.objectives as objective}
					<div class="flex flex-col gap-1 mt-2">
						<div class="gallery gap-2">
							<div class="gallery flex-1 gap-2">
								<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">🎯</span>
								<a href={`/objectives/${objective.id}`} class="tactile-text">{objective.title}</a>
							</div>
							<div class="rounded item-background h-6 w-12 frame">
								<a href={`/objectives/${objective.id}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
							</div>
						</div>
						<p class="text-muted-foreground text-xs whitespace-pre-wrap">{objective.description}</p>
					</div>
				{/each}
				<Separator class="my-4"/>
				<div class="gallery">
					<span class="text-sm text-muted-foreground font-regular flex-1">Updates</span>
					<Dialog.Root>
						<Dialog.Trigger>
							<span class="text-[0.7rem] text-muted-foreground font-regular hover:green-light hover:text-white transition-all">{"New update"}</span>
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>Post project update</Dialog.Header>
							<div class="flex flex-col gap-2">
								<div class="gallery">
									<input type="text" placeholder="Icon" class="border size-8 text-center" value="🥳"/>
									<input type="text" placeholder="Title" class=""/>
								</div>
								<textarea placeholder="Description" class="border"/>
							</div>
							<Dialog.Footer>
								<Button>Post</Button>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>
				</div>
				{#each [{ title: "All is well", body: "Project is going great and on time. Thank you everyone!" }] as update}
					<div class="flex flex-col gap-1 mt-2">
						<div class="gallery gap-2">
							<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">👍</span>
							<span class="tactile-text">{update.title}</span>
						</div>
						<p class="text-muted-foreground text-xs whitespace-pre-wrap">{update.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>