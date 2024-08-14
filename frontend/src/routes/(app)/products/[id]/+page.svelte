<script lang="ts">
    import { Separator } from "@/components/ui/separator";
    import type { PageData } from "./$types";
    import { page } from "$app/stores";
    import { blur } from "svelte/transition";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<main class="flex-1 grid">
		<div class="flex">
			<div class="p-16">
				<h1 class="text-5xl font-semibold bg-gradient-to-b from-popover-foreground to-muted-foreground bg-clip-text text-transparent" in:blur>{data.project.name}</h1>
				<Separator class="my-4"/>
				<div class="w-full flex justify-evenly">
					<a href={`${$page.url}/features`} class="underline">
						Features
					</a>
					<Separator orientation="vertical" class="mx-4"/>
					<a href={`${$page.url}/bugs`} class="underline">
						Bugs
					</a>
					<Separator orientation="vertical" class="mx-4"/>
					<a href={`${$page.url}/tasks`} class="underline">
						Tasks
					</a>
				</div>
				<Separator class="my-4"/>
				<p class="text-muted-foreground h-[8lh]">
					{data.project.description}
				</p>
			</div>
			<Separator orientation="vertical" class="mx-4"/>
			<div class="w-80 p-4">
				<span class="text-sm text-muted-foreground font-regular">Applications</span>
				{#await data.applications}
					Loading applications...
				{:then applications}
					{#each applications as application}
						<div class="flex flex-col gap-1 mt-2">
							<div class="gallery gap-2">
								<a href={`/applications/${application.id}`} class="tactile-text">{application.name}</a>
							</div>
							<p class="text-muted-foreground text-xs line-clamp-2 whitespace-pre-wrap">{application.description}</p>
						</div>
					{/each}
				{/await}
			</div>
			<div class="w-80">
				<span class="text-sm text-muted-foreground font-regular">Projects</span>
				{#each [{ title: "All is well", body: "Project is going great and on time. Thank you everyone!" }] as update}
					<div class="flex flex-col gap-1 mt-2">
						<div class="gallery gap-2">
							<span class="border rounded-full text-[0.7rem] w-5 h-5 flex items-center justify-center">👍</span>
							<a href="/projects" class="tactile-text">{update.title}</a>
						</div>
						<p class="text-muted-foreground text-xs whitespace-pre-wrap">{update.body}</p>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>