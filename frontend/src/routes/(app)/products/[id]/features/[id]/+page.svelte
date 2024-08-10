<script lang="ts">
    import Separator from "@/components/ui/separator/separator.svelte";
import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
</script>

<div class="flex-1 flex flex-col px-12 py-8">
    <div class="gallery flex-1">
        <h1 class="tactile-text text-2xl">
            {data.feature.name}
        </h1>
    </div>
    <Separator class="my-4"/>
    <div class="flex flex-col flex-1">
        <span class="text-sm text-muted-foreground">Description</span>
        <textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea>
        <span class="text-sm text-muted-foreground">Blah</span>
        <textarea class="flex-1 w-full p-2 border border-transparent hover:border-neutral-500 min-h-[8lh] rounded bg-transparent transition-all" readonly>{data.feature.description}</textarea>
    </div>
</div>