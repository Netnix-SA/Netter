<script lang="ts">
    import type { Colors } from "../db/types";

	let { user }: { user: { id: string, full_name: string, color: Colors } | undefined } = $props();

	let display = $derived(user ? user.full_name.split(" ").slice(0, 2).map((name) => name[0]).join("") : "?");
</script>

<a href={`/users/${user?.id ?? '404'}`} class:bg-green-500={user?.color === "Green/Light"} class:bg-orange-500={user?.color === "Orange/Light"} class:bg-purple-500={user?.color === "Purple/Light"} class:bg-red-500={user?.color === "Red/Light"} class="rounded border border-neutral-500 size-6 flex items-center justify-center text-sm font-medium tracking-wide select-none">
	<span class="">
		{display}
	</span>
</a>

<style>
	.green-background {
		/* background: linear-gradient(to bottom, hsl(80, 50, 90), hsl(100, 70, 70)); */
		/* background: linear-gradient(to bottom, hsl(80, 50, 90), hsl(100, 70, 70)); */
		/* box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 2px 6px black; */
	}
</style>