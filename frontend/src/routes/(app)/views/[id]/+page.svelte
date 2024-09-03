<script lang="ts">
    import TaskList from "@/components/TaskList.svelte";
    import type { PageData } from "./$types";
    import { groupBy } from "@/utils";
    import Filters from "@/components/filters/Filters.svelte";
    import Pin from "@/components/Pin.svelte";

	let { data }: { data: PageData } = $props();

	let groups = $derived(groupBy(data.data, ({ status }) => status.id));
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.view.name}
		</h1>
	</div>
	<Pin pinned={data.user.pinned} id={data.view.id}/>
</header>
<main class="flex-1 w-full">
	<header class="gallery">
		<Filters filters={data.view.filters} labels={data.labels}/>
	</header>
	<TaskList groups={groups.entries()} labels={data.labels} users={data.users} statuses={data.statuses}/>
</main>
