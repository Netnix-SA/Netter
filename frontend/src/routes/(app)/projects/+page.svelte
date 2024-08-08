<script lang="ts">
	import UserAvatar from "@/components/UserAvatar.svelte";
	import type { PageData } from "./$types";
    import Label from "@/components/ui/label/label.svelte";
	  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";

	const { data }: { data: PageData } = $props();
	const projects = $derived(data.projects);
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My projects
	</header>
	<main>
		<ul class="divide-y">
			{#each projects as project}
				<li class="px-6 py-2 flex items-center border-b">
					<a href={`/projects/${project.id}`} class="flex-1">
						<span class="text-xs font-medium tactile-text">
							{project.name}
						</span>
					</a>
					<div class="gallery gap-2">
						<span class="text-xs text-muted-foreground">Lead</span>
						<UserAvatar full_name={data.users.find(u => u.id === project.lead?.id)?.full_name}/>
					</div>
				</li>
			{/each}
		</ul>
	</main>
</div>