<script lang="ts">
    let { full_name }: { full_name: string | undefined } = $props();

    let display = $derived(full_name ? full_name.split(" ").slice(0, 2).map((name) => name[0]).join("") : "?");
</script>

<div class="rounded border border-neutral-500 bg-green-500 w-6 h-6 flex items-center justify-center text-sm font-medium tracking-wide select-none">
    {display}
</div>