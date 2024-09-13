<script lang="ts">
	import * as Command from "$lib/components/ui/command";
	import { client } from "@/state";

	let { onselect, filter, children, }: { onselect: (id: string) => void, filter?: { class?: string, exclude?: string[] }, children: any } = $props();

	let entries: { id: string, title: string }[] = $state([]);

	async function handleInput(e: Event) {
		const { data } = await client.api.get({ query: { text: search, class: filter?.class, exclude: filter?.exclude } });
		entries = data;
	}

	let search = $state('');
	let open = $state(false);

	$inspect(open);
</script>

<button onclick={() => open = true}>
	{@render children()}
</button>

<Command.Dialog loop shouldFilter={false} bind:open>
	<Command.Input bind:value={search} oninput={handleInput} placeholder="Type a command or search..."/>
	<Command.Empty>No results found.</Command.Empty>
	<Command.List>
		<Command.Group heading="Results">
			{#each entries as { id, title }(id)}
				<Command.Item class="h-8" onSelect={() => { onselect(id); open = false; search = ''; }}>{title}</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
