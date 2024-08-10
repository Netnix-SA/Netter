<script lang="ts">
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex-1 flex flex-col w-full">
    <ul class="flex flex-col flex-1">
        {#each data.applications as application}
            <li class="gallery border-b h-10 px-4">
                <a href={`/applications/${application.id}`} class="tactile-text text-sm">
                    {application.name}
                </a>
            </li>
        {/each}
    </ul>
</div>