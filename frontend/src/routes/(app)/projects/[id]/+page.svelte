<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData, } from "./$types";
    import { page } from "$app/stores";

	import * as Sheet from "$lib/components/ui/sheet";
	import * as Dialog from "$lib/components/ui/dialog";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	import { blur } from 'svelte/transition';
	import { onMount } from "svelte";
	import { task } from "@/all.svelte";
    import { CalendarArrowUp, Check, Clock9, Star } from "lucide-svelte";
    import UserSelect from "@/components/UserSelect.svelte";
    import { CLASSES, STATES } from "@/global";
    import Select from "@/components/Select.svelte";
    import { Button } from "@/components/ui/button";
    import Pin from "@/components/Pin.svelte";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
    import { client } from "@/state";
    import { toast } from "svelte-sonner";
    import { goto, invalidate } from "$app/navigation";
    import { DotsHorizontal } from "svelte-radix";

	const { data }: { data: PageData } = $props();

	const project = $derived(data.project);

	onMount(() => {
		task.project = data.project.id;
	});

	let lead = $state(data.users.find(u => u.id === data.project.lead?.id) || null);

	const queryClient = useQueryClient();

	const objectiveCreate = createMutation(() => ({
		mutationFn: async () => {
			console.log("Creating objective");
			const response = await client.api.projects({ id: project.id }).objectives.post({ title: "New objective", description: "Objective description" });
			if (response.data) {
				return response.data;
			} else {
				console.error(response.error);
				throw new Error("Failed to create objective");
			}
		},
		onSuccess: (response) => {
			toast.success("Created new objective!", {
				action: {
					label: "Open",
					onClick: () => {
						goto(`/objectives/${response.id}`);
					},
				}
			});
			queryClient.invalidateQueries({ queryKey: ["project", project.id, "objectives"] });
			invalidate('project:get');
		},
	}));

	const projectDelete = createMutation(() => ({
		mutationFn: async () => {
			const response = await client.api.projects({ id: project.id }).delete();
			if (response.error) {
				throw new Error("Failed to delete project");
			}
		},
		onSuccess: () => {
			toast.success("Deleted project!");
			invalidate('projects:get');
			goto("/projects");
		},
		onError: (e) => {
			toast.error("Failed to delete project");
		},
	}));
</script>

<svelte:head>
	<title>{project.name}</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{project.name}
		</h1>
		<div class="gallery gap-2">
			<a href={`${$page.url}/tasks`} class="rounded item-background h-6 w-12 frame">
				<span  class="text-xs text-center tactile-text">Tasks</span>
			</a>
		</div>
	</div>
	<DropdownMenu.Root>
		<DropdownMenu.Trigger class="rounded border frame size-6">
			<DotsHorizontal class="size-4"/>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content>
			{#each CLASSES["Project"].actions as { label, icon: Icon, action }}
			{#if label === "Delete"}
				<DropdownMenu.Separator/>
			{/if}
			<DropdownMenu.Item onclick={async () => await action(queryClient, project.id)} class={`${label === "Delete" ? "text-red-400" : ""}`}>
				<Icon class="size-4 mr-2"/> {label}
			</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Root>
	<!-- <Pin pinned={data.user.pinned} id={data.project.id}/> -->
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
			<div class="w-96 column gap-16">
				<section class="column gap-2">
					<div class="gallery">
						<span class="text-sm text-muted-foreground font-regular flex-1">Objectives</span>
						<Dialog.Root>
							<Dialog.Trigger>
								<span class="text-[0.7rem] text-muted-foreground font-regular hover:green-light hover:text-white transition-all">{"New objective"}</span>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>Create objective</Dialog.Header>
								<div class="flex flex-col gap-2">
									<div class="gallery gap-2 h-8">
										<input type="text" placeholder="Icon" class="border size-8 text-center" value="🎯"/>
										<input type="text" placeholder="Title" class="border flex-1 h-full px-2"/>
									</div>
									<textarea placeholder="Description" class="border px-2 py-1"/>
								</div>
								<Dialog.Footer>
									<Button on:click={() => objectiveCreate.mutate()}>Create</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>
					<div class="column h-32 overflow-scroll">
					{#each data.objectives as objective}
						<div class="flex flex-col gap-1 h-16 shrink-0">
							<div class="gallery gap-2">
								<div class="gallery flex-1 gap-2">
									<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">🎯</span>
									<a href={`/objectives/${objective.id}`} class="tactile-text">{objective.title}</a>
									{#if objective.active}
										<div class="rounded-full green-light size-1 bg-white animate-pulse"></div>
									{/if}
								</div>
								<div class="rounded item-background h-6 w-12 frame">
									<a href={`/objectives/${objective.id}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
								</div>
							</div>
							<p class="text-muted-foreground text-xs whitespace-pre-wrap">{objective.description}</p>
						</div>
					{:else}
						<div class="frame h-16">
							<span class="text-muted-foreground/50 text-xs select-none">No objectives</span>
						</div>
					{/each}
					</div>
				</section>
				<section class="w-full">
					<div class="gallery">
						<span class="text-sm text-muted-foreground font-regular flex-1">Updates</span>
						<Dialog.Root>
							<Dialog.Trigger>
								<span class="text-[0.7rem] text-muted-foreground font-regular hover:green-light hover:text-white transition-all">{"New update"}</span>
							</Dialog.Trigger>
							<Dialog.Content>
								<Dialog.Header>Post project update</Dialog.Header>
								<div class="flex flex-col gap-2">
									<div class="gallery gap-2 h-8">
										<input type="text" placeholder="Icon" class="border size-8 text-center" value="🥳"/>
										<input type="text" placeholder="Title" class="flex-1 h-full px-2 border"/>
									</div>
									<textarea placeholder="Description" class="border px-2 py-1"/>
								</div>
								<Dialog.Footer>
									<Button>Post</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</div>
					{#each data.project.updates as update}
						<div class="flex flex-col gap-1 h-16">
							<div class="gallery gap-2">
								<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">👍</span>
								<span class="tactile-text">{update.title}</span>
							</div>
							<p class="text-muted-foreground text-xs whitespace-pre-wrap">{update.body}</p>
						</div>
					{:else}
						<div class="frame h-16">
							<span class="text-muted-foreground/50 text-xs select-none">No updates</span>
						</div>
					{/each}
				</section>
				<section class="column gap-2">
					<UserSelect label="Lead" values={data.users} bind:value={lead}/>
					<Select label="Status" comparator={(a, b) => a.id === b.id} values={data.statuses.map(s => ({ label: s.name, value: s, icon: STATES.find(state => state.value === s.state)?.icon ?? Star }) )} value={data.project.status}/>
				</section>
			</div>
		</div>
	</main>
</div>
