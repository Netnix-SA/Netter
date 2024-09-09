<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import type { PageData } from "./$types";
    import Separator from "@/components/ui/separator/separator.svelte";
    import { ExternalLink } from "lucide-svelte";
    import { createMutation, createQuery, useQueryClient } from "@tanstack/svelte-query";
    import { client } from "@/state";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import { blur } from "svelte/transition";
    import { flyAndScale } from "@/utils";

	const { data }: { data: PageData } = $props();

	const queryClient = useQueryClient();

	const projectsGet = createQuery(() => ({
		queryKey: ['projects'],
		queryFn: () => {
			return client.api.projects.get();
		},
	}));

	const projectCreate = createMutation(() => ({
		mutationFn: () => {
			return client.api.projects.post({ name: "New Project", description: "Project description", lead: null, members: [], client: null, end: null });
		},
		onSuccess: (response) => {
			if (response.data?.id) {
				queryClient.invalidateQueries({ queryKey: ['projects'] });
				toast.success("Created project", {
					action: {
						label: "Open",
						onClick: () => goto(`/projects/${response.data.id}`),
					},
				});
			}
		},
	}));
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10 shrink-0">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My projects
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-primary-foreground rounded-md" onclick={() => projectCreate.mutate()}>
		+
	</button>
	<!-- <Pin pinned={data.user.pinned} id={data.objective.id}/> -->
</header>
<main class="w-full h-full flex-1 flex flex-col shadow-inner">
	{#if projectsGet.isLoading}
	Loading project...
	{:else if projectsGet.isError}
	{projectsGet.error.message}
	{:else if projectsGet.isSuccess}
	<ul class="flex-1 h-full overflow-y-scroll">
		{#each projectsGet.data.data ?? [] as project(project.id)}
			<li class="px-6 py-2 flex items-center border-b" transition:blur>
				<div id="left" class="gallery gap-4 flex-1">
					<a href={`/projects/${project.id}`} class="">
						<span class="text-xs font-medium tactile-text">
							{project.name}
						</span>
					</a>
					<div class="gallery gap-2">
						<a href={`/projects/${project.id}/tasks`} class="text-xs gallery item-background h-6 px-2 rounded">
							Tasks
						</a>
						<a href={`/projects/${project.id}/objectives/active`} class="text-xs gallery item-background h-6 px-2 rounded">
							Objective
						</a>
					</div>
				</div>
				<div class="gallery gap-2">
					<div class="gallery gap-2">
						<span class="text-xs text-muted-foreground">Lead</span>
						<UserAvatar user={data.users.find(u => u.id === project.lead?.id)}/>
					</div>
				</div>
			</li>
		{:else}
			<div class="frame size-full">
				<span class="text-sm italic text-muted-foreground/50">
					No projects yet
				</span>
			</div>
		{/each}
	</ul>
	{/if}
</main>