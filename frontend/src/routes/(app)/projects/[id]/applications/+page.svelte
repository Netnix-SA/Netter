<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    $inspect(data);
</script>

<div class="flex-1 flex">
    <ul class="">
        {#each data.applications as application}
            <li>
                {application.name}
            </li>
        {/each}
    </ul>
</div>