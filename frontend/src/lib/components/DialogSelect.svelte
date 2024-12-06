<script lang="ts">
	import * as Command from "$lib/components/ui/command";
	import { client } from "@/state";
    import type { Classes } from "@/types";
    import { CLASSES } from "@/utils";

	let { onselect, filter, children, }: { onselect: (id: string) => void, filter?: { class?: string, exclude?: string[] }, children: any } = $props();

	let entries: { id: string, title: string, class: Classes }[] = $state([]);

	async function handleInput(e: Event, { suggest }: { suggest?: string }) {
		let query = { text: search, exclude: filter?.exclude, };
		if (suggest) query.suggest = suggest;
		if (filter?.class) query.class = filter.class;
		const { data } = await client.api.get({ query });
		entries = data;
	}

	let search = $state('');
	let open = $state(false);

	$effect(() => { // Run query on mount and when filter changes
		handleInput(new Event("input"), { suggest: !search ? filter?.class : undefined });
	});
</script>

<button onclick={() => open = true}>
	{@render children()}
</button>

<Command.Dialog loop shouldFilter={false} bind:open>
	<Command.Input bind:value={search} placeholder="Search"/>
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Results">
			{#each entries as { id, title, class: clss }(id)}
			{@const Icon = CLASSES[clss]?.icon}
				<Command.Item class="h-8" onSelect={() => { onselect(id); open = false; search = ''; }}>
					<Icon class="size-4 mr-2"/>
					{title}
				</Command.Item>
			{/each}
		</Command.Group>
	</Command.List>
</Command.Dialog>
