<script lang="ts">
	import type { PageData } from "./$types";

	import * as Table from "$lib/components/ui/table/index.js";
    import { createProductComponentMutation, createProductFeatureMutation } from "@/state";
    import { goto } from "$app/navigation";

	let { data }: { data: PageData } = $props();

	type Type = {};
</script>

<header class="gallery bg-primary-foreground w-full border-b px-4 h-10">
	<div class="gallery flex-1 gap-4">
		<h1 class="tactile-text text-sm">
			{data.product.name} {'/'} Components
		</h1>
	</div>
	<button class="size-6 frame border border-dashed hover:border-solid text-md transition-all bg-background hover:bg-accent rounded-md" onclick={async () => await createProductComponentMutation({})({ id: data.product.id })}>
		+
	</button>
</header>
<ul class="flex-1 flex flex-col w-full">
	{#await data.components}
		Loading components...
	{:then components}
	<Table.Root>
		<Table.Header>
			<Table.Row>
				<Table.Cell>
					Name
				</Table.Cell>
				<Table.Cell>
					Type
				</Table.Cell>
			</Table.Row>
		</Table.Header>
		<Table.Body class="leading-3">
			{#each components as component}
				<Table.Row>
					<Table.Cell onclick={() => goto(`/components/${component.id}`)}>
						{component.name}
					</Table.Cell>
					<Table.Cell>
						{component.type}
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
	{/await}
</ul>