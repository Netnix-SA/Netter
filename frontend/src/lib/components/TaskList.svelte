<script lang="ts">
    import { ChevronDown, Plus } from "lucide-svelte";

	import Table from "$lib/components/Table.svelte";

    import TaskLine from "./TaskLine.svelte";
    import type { Efforts, Priorities, Value, Status } from "@/types";
    import { cn, color_to_class, EFFORTS_ICONS, PRIORITIES_ICONS, STATES, STATES_ICONS, VALUES_ICONS } from "@/utils.ts";
    import { goto } from "$app/navigation";
    import { client } from "@/state";
    import { renderComponent } from "./ui/data-table";
    import { Checkbox } from "$lib/components/ui/checkbox/index.js";

	type Task = {
		id: string,
		progress: number,
		title: string, body: string,
		status: { id: string, },
		priority: Priorities, effort: Efforts, value: Value,
		assignee: { id: string } | null,
		labels: { id: string }[],
		related: { id: string }[],
	};

	let {
		tasks,
		draft_task = $bindable(),
		onselect = () => {},
	}: { tasks: Task[], draft_task?: Omit<Task, "id"> | null, onselect: (id: string) => void } = $props();
</script>

<Table columns={[{ accessorKey: "title", header: "Title", enableSorting: true }]} data={tasks} selectable={true}/>