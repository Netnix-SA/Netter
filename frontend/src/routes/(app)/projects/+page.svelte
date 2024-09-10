<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import type { PageData } from "./$types";
    import { client, createProjectMutation } from "@/state";
    import { blur } from "svelte/transition";

	const { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Projects</title>
</svelte:head>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10 shrink-0">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			My projects
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-primary-foreground rounded-md" onclick={async () => await createProjectMutation({})()}>
		+
	</button>
</header>
<main class="w-full h-full flex-1 flex flex-col shadow-inner">
	<ul class="flex-1 h-full overflow-y-scroll">
		{#each data.projects as project(project.id)}
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
</main>