<script lang="ts" generics="TData, TValue">
	import { type ColumnDef, getCoreRowModel } from "@tanstack/table-core";
	import {
		createSvelteTable,
		FlexRender,
        renderComponent,
	} from "$lib/components/ui/data-table/index.js";
	import * as Table from "$lib/components/ui/table/index.js";
    import { Checkbox } from "./ui/checkbox";

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
		selectable?: boolean;
	};

	let { data, columns, selectable }: DataTableProps<TData, TValue> = $props();

	if (selectable) {
		columns = [
			{
				id: "select", header: ({ table }) =>
				renderComponent(Checkbox, {
					checked: table.getIsAllPageRowsSelected(),
					indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
					onCheckedChange: (value) => table.toggleAllPageRowsSelected(!!value),
					"aria-label": "Select all",
				}),
				cell: ({ row }) =>
				renderComponent(Checkbox, {
					checked: row.getIsSelected(),
					onCheckedChange: (value) => row.toggleSelected(!!value),
					"aria-label": "Select row",
				}),
				enableSorting: false,
				enableHiding: false,
			},
			...columns,
		];
	}

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
</script>

<div class="rounded-md border">
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
		<Table.Body>
			{#each table.getRowModel().rows as row (row.id)}
				<Table.Row data-state={row.getIsSelected() && "selected"}>
					{#each row.getVisibleCells() as cell (cell.id)}
						<Table.Cell class="h-8">
							<FlexRender
								content={cell.column.columnDef.cell}
								context={cell.getContext()}
							/>
						</Table.Cell>
					{/each}
				</Table.Row>
			{:else}
				<Table.Row>
					<Table.Cell
						colspan={columns.length}
						class="h-24 text-center"
					>
						No results.
					</Table.Cell>
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
		
	<div class="text-muted-foreground flex-1 text-sm">
		{table.getFilteredSelectedRowModel().rows.length} of{" "} {table.getFilteredRowModel().rows.length} row(s) selected.
	</div>  
</div>
