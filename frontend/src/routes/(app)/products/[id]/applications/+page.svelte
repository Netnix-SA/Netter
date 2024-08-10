<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<ul class="flex-1 flex flex-col w-full">
    {#await data.applications}
        Loading applications...
    {:then applications}
        {#each applications as application}
            <li class="border-b gallery h-10 px-6 text-sm tactile-text">
                <a href={`/applications/${application.id}`}>{application.name}</a>
            </li>
        {/each}
    {/await}
</ul>