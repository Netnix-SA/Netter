<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { EFFORTS, EFFORTS_ICONS, PRIORITIES, PRIORITIES_ICONS } from "@/global";
	import Circle from "./Circle.svelte";
	import UserAvatar from "./UserAvatar.svelte";
	import { addPinned, addToDo } from "@/actions";
    import LabelChip from "./LabelChip.svelte";
    import { createMutation, useQueryClient } from "@tanstack/svelte-query";
    import { client } from "@/state";
    import { toast } from "svelte-sonner";
    import { todo } from "@/all.svelte";
    import { blur } from "svelte/transition";

	type Task = { id: string, title: string, labels: { id: string, }[], progress: number, priority: "Low" | "Medium" | "High" | "Urgent", effort: string };
	type Label = { id: string, title: string, icon: string, color: string };

	let { task, user, labels }: { task: Task, labels: Label[], user: { id: string, full_name: string } | undefined/* | ((id: string) => Promise<{ id: string, full_name: string }>)*/ } = $props();

	const queryClient = useQueryClient();

	let pinCreate = createMutation(() => ({
		mutationFn: ({ id }: { id: string }) => {
			return client.api.users.me.pins.post({ id });
		},
		onSuccess: () => {
			toast.success("Pinned");
			queryClient.invalidateQueries({ queryKey: ['pins'] });
		},
	}));
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="w-full">
		{#key task.id}
		<li class="flex-1 px-2 gallery border-b" transition:blur>
		<div id="left" class="gallery flex-1 gap-2">
			<Circle value={task.progress}/>
			<a href={`/tasks/${task.id}`} class="flex items-center min-w-32">
				<span class="text-sm tactile-text">
					{task.title}
				</span>
			</a>
			{#each task.labels as { id }}
			{@const label = labels.find(l => l.id === id)}
			{#if label}
				<LabelChip {label}/>
			{/if}
			{/each}
		</div>
		<div id="right" class="gallery gap-2 pr-1">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame bg-primary-foreground rounded-md border">
					{@const Icon = EFFORTS_ICONS[task.effort]}
					<Icon class="size-4"/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each EFFORTS as effort}
						<DropdownMenu.Item onclick={() => { task.effort = effort.value; /* TODO: post update */ }}>
							{@const Icon = EFFORTS_ICONS[effort.value]}
							<Icon class="size-4 mr-2"/> {effort.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame bg-primary-foreground rounded-md border">
					{@const Icon = PRIORITIES_ICONS[task.priority]}
					<Icon class="size-4"/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each PRIORITIES as priority}
						<DropdownMenu.Item onclick={() => { task.priority = priority.value; /* TODO: post update */ }}>
							{@const Icon = PRIORITIES_ICONS[priority.value]}
							<Icon class="size-4 mr-2"/> {priority.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<div class="gallery">
				<UserAvatar {user}/>
			</div>
			<!-- <div class="gallery">
				{#each task.labels as { id }}
				{@const label = data.labels.find(l => l.id === id)}
					<Label {label}/>
				{/each}
			</div> -->
		</div>
		</li>
		{/key}
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item onclick={() => pinCreate.mutate({ id: task.id })}>Pin</ContextMenu.Item>
		<ContextMenu.Item onclick={() => todo.value = { related: { id: task.id, title: task.title } }}>Add to ToDo's</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>