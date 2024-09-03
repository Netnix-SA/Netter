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

<input type="search" placeholder={"Search"} bind:value={search} oninput={handleInput}/>
{#key search}
<Command>
	<CommandList>
		<CommandEmpty>No results found.</CommandEmpty>
		{#if entries.length > 0}
		
			{#each entries as { id, title }(id)}
				<CommandItem class="h-8" onSelect={async () => {}}>{title}</CommandItem>
			{/each}
			<CommandSeparator/>
			{/if}
		</CommandList>
	</Command>
{/key}