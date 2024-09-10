<script lang="ts">
    import type { Snippet } from "svelte";
    import "../app.css";

    let { children }: { children: Snippet<[]> } = $props();
</script>

<svelte:head>
    <title>Netter</title>
</svelte:head>

{@render children()}