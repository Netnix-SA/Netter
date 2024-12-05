<script lang="ts">
    import TaskList from "@/components/TaskList.svelte";
    import type { PageData } from "./$types";
    import { groupBy } from "@/utils";

    let { data }: { data: PageData } = $props();
</script>

<main class="flex-1 w-full">
	<TaskList tasks={data.tasks}/>
</main>