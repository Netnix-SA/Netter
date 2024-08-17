<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

{#each data.repository.branches as branch}
    {branch.name}
{/each}