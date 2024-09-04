<script lang="ts">
	import { Command, CommandList, CommandEmpty, CommandItem, CommandSeparator, } from "$lib/components/ui/command";
    import { client } from "@/state";

	let search = $state("");
	let entries: any[] = $state([]);

	async function handleInput(e: Event) {
		const { data } = await client.api.get({ query: { text: search } });
		entries = data;
	}
</script>

<div class="relative min-h-10 w-64 group">
	<input type="search" placeholder={"Search"} class="border px-2 py-1" bind:value={search} oninput={handleInput}/>
	<div class="absolute shadow-2xl top-10 left-0 border rounded-md w-64 hidden group-focus-within:block">
		{#key search}
		<Command>
			<CommandList>
				{#if search === ""}
					<CommandEmpty>Start typing to search.</CommandEmpty>
				{:else}
					<CommandEmpty>No results found.</CommandEmpty>
				{/if}
				{#if entries.length > 0}
					{#each entries as { id, title }(id)}
						<CommandItem class="h-8" onSelect={async () => {}}>{title}</CommandItem>
					{/each}
				{/if}
			</CommandList>
		</Command>
		{/key}
	</div>
</div>