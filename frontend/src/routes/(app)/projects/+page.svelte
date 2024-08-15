<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import type { PageData } from "./$types";
    import Separator from "@/components/ui/separator/separator.svelte";
    import { ExternalLink } from "lucide-svelte";

	const { data }: { data: PageData } = $props();
	const projects = $derived(data.projects);
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm header-background">
		My projects
	</header>
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
						<div class="gallery item-background h-6 px-2 rounded">
							<a href={`/projects/${project.id}/tasks`} class="text-xs">
								Tasks
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