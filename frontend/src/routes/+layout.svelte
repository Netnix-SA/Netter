<script lang="ts">
    import type { Snippet } from "svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";
    import Confetti from "svelte-confetti";
    import { confetti } from "@/global.svelte";

    let { children }: { children: Snippet<[]> } = $props();
</script>

<svelte:head>
    <title>Netter</title>
</svelte:head>

<Toaster/>
{#key confetti.key}
	{#if confetti.key}
		<Confetti x={[-10, 10]} y={[0, 0.5]} delay={[0, 500]} duration={2000} amount={500} fallDistance="100vh"/>
	{/if}
{/key}
{@render children()}