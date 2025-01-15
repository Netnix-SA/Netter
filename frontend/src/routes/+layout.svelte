<script lang="ts">
    import type { Snippet } from "svelte";
    import "../app.css";
    import { Toaster } from "svelte-sonner";
    import { confetti } from "@/global.svelte";

	import { Svate, SvateContextProvider } from "@facundo-villa/svate";

    let { children }: { children: Snippet<[]> } = $props();

	const svate = new Svate();
</script>

<svelte:head>
    <title>Netter</title>
</svelte:head>

<Toaster/>
{#key confetti.key}
	{#if confetti.key}
		<!-- <Confetti x={[-10, 10]} y={[0, 0.5]} delay={[0, 500]} duration={2000} amount={500} fallDistance="100vh"/> -->
	{/if}
{/key}
<SvateContextProvider {svate}>
	{@render children()}
</SvateContextProvider>