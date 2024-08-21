<script lang="ts">
    import TaskList from "@/components/TaskList.svelte";
    import type { PageData } from "./$types";
    import { groupBy } from "@/utils";

    let { data }: { data: PageData } = $props();

	let groups = $derived(groupBy(data.tasks, ({ status }) => status.id));
</script>

<main class="flex-1 w-full">
	<TaskList groups={groups.entries()} labels={data.labels} users={data.users} statuses={data.statuses}/>
</main>