<script lang="ts">
    import TaskList from "@/components/TaskList.svelte";
    import type { PageData } from "./$types";
    import { groupBy } from "@/utils";
    import Filters from "@/components/filters/Filters.svelte";

	let { data }: { data: PageData } = $props();

	let groups = $derived(groupBy(data.data, ({ status }) => status.id));
</script>

<header class="flex w-full px-6 h-10 items-center text-sm bg-primary-foreground border-b">
	{data.view.name}
</header>
<main class="flex-1 w-full">
	<header class="gallery">
		<Filters filters={data.view.filters} labels={data.labels}/>
	</header>
	<TaskList groups={groups.entries()} labels={data.labels} users={data.users} statuses={data.statuses}/>
</main>
