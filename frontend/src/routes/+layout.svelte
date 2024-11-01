<script lang="ts">
    import type { Snippet } from "svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";

    let { children }: { children: Snippet<[]> } = $props();
</script>

<svelte:head>
    <title>Netter</title>
</svelte:head>

<Toaster/>
{@render children()}