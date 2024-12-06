<script lang="ts">
	import type { PageData } from "./$types";

	import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
	import {
		createSvelteTable,
		FlexRender,
	} from "$lib/components/ui/data-table/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
    import { createProductComponentMutation, createProductFeatureMutation } from "@/state";
    import { goto } from "$app/navigation";
	
	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};
	
	let columns: ColumnDef<Type>[] = [
		{ accessorKey: "name", header: "Name" },
		{ accessorKey: "type", header: "Type" },
	];

	const table = createSvelteTable({
		get data() {
			return data.components;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

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
		<div class="">
			<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<Table.Row>
					{#each headerGroup.headers as header (header.id)}
					<Table.Head>
						{#if !header.isPlaceholder}
						<FlexRender
							content={header.column.columnDef.header}
							context={header.getContext()}
						/>
						{/if}
					</Table.Head>
					{/each}
				</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body class="leading-3">
				{#each table.getRowModel().rows as row (row.id)}
				<Table.Row>
					{#each row.getVisibleCells() as cell (cell.id)}
					<Table.Cell>
						<FlexRender
						content={cell.column.columnDef.cell}
						context={cell.getContext()}
						/>
					</Table.Cell>
					{/each}
				</Table.Row>
				{:else}
				<Table.Row>
					<Table.Cell colspan={columns.length} class="h-24 text-center">
						No results.
					</Table.Cell>
				</Table.Row>
				{/each}
			</Table.Body>
			</Table.Root>
		</div>
	{/await}
</ul>