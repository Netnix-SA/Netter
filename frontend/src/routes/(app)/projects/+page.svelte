<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import type { PageData } from "./$types";
    import Separator from "@/components/ui/separator/separator.svelte";
    import { ExternalLink } from "lucide-svelte";

	const { data }: { data: PageData } = $props();
	const projects = $derived(data.projects);
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My projects
		</h1>
		<!-- <div class="rounded item-background h-6 w-12 frame">
			<a href={`${$page.url}/tasks`} class="text-xs text-center tactile-text">Tasks</a>
		</div> -->
	</div>
	<!-- <Pin pinned={data.user.pinned} id={data.objective.id}/> -->
</header>
<div class="flex-1 flex flex-col w-full divide-y">
	<main>
		<ul class="divide-y">
			{#each projects as project}
				<li class="px-6 py-2 flex items-center border-b">
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
			{/each}
		</ul>
	</main>
</div>
