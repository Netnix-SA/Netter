<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
	import type { PageData, } from "./$types";
    import { page } from "$app/stores";
	import * as Sheet from "$lib/components/ui/sheet";
	import { blur } from 'svelte/transition';
    import { CalendarArrowUp, Check, Clock9 } from "lucide-svelte";
    import UserSelect from "@/components/UserSelect.svelte";

	const { data }: { data: PageData } = $props();
	const project = $derived(data.project);

	let lead = $state(data.users.find(u => u.id === data.project.lead?.id) || null);
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm" style="background:linear-gradient(to right, #101010 0%, rgb(10, 10, 10) 80%);">
		{project.name}
	</header>
	<main class="flex-1 flex items-center justify-center page-backdrop">
		<div class="flex">
			<div>
				<h1 class="text-5xl font-semibold bg-gradient-to-b from-popover-foreground to-muted-foreground bg-clip-text text-transparent" in:blur>{project.name}</h1>
				<Separator class="my-4"/>
				<div class="w-full flex justify-evenly">
					<a href={`${$page.url}/features`} class="underline">
						Features
					</a>
					<Separator orientation="vertical" class="mx-4"/>
					<a href={`${$page.url}/applications`} class="underline">
						Applications
					</a>
					<Separator orientation="vertical" class="mx-4"/>
					<a href={`${$page.url}/tasks`} class="underline">
						Tasks
					</a>
				</div>
				<Separator class="my-4"/>
				<p class="text-muted-foreground h-[8lh]">
					{project.description}
				</p>
				<Separator class="my-4"/>
				<span class="text-sm text-muted-foreground font-regular">Milestones</span>
				{#snippet milestone({ i, name, description, status }: { i: number, name: string, description: string, status: "done" | "current" | "upcoming" })}
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
					<Sheet.Trigger><span class="text-[0.6rem] text-muted-foreground font-regular">{"(2 more)"}</span></Sheet.Trigger>
					<Sheet.Content>
					  <Sheet.Header>
						<Sheet.Title>Milestones</Sheet.Title>
						<Sheet.Description>
							{#each project.milestones as { title, description }, i}
								{@render milestone({ i, name: title, description, status: "done" })}
							{/each}
						</Sheet.Description>
					  </Sheet.Header>
					</Sheet.Content>
				</Sheet.Root>
				<div class="flex">
					{@render milestone({ i: 0, name: "MVP", description: "This milestone marks our first working product iteration. It will allow us to secure funding.", status: "done" })}
					<Separator orientation="vertical" class="mx-4"/>
					{@render milestone({ i: 1, name: "Beta", description: "This milestone...", status: "current" })}
					<Separator orientation="vertical" class="mx-4"/>
					{@render milestone({ i: 2, name: "v1.0", description: "This milestone...", status: "upcoming" })}
				</div>
			</div>
			<Separator orientation="vertical" class="mx-4"/>
			<div class="w-80">
				<UserSelect label="Lead" values={data.users} bind:value={lead}/>
				<Separator class="my-4"/>
				<span class="text-sm text-muted-foreground font-regular">Status</span>
				<Separator class="my-4"/>
				<span class="text-sm text-muted-foreground font-regular">Updates</span>
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