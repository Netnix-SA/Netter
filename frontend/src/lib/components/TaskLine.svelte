<script lang="ts">
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { EFFORTS, EFFORTS_ICONS, PRIORITIES, PRIORITIES_ICONS } from "@/global";
	import Circle from "./Circle.svelte";
	import UserAvatar from "./UserAvatar.svelte";
	import { addPinned, addToDo } from "@/actions";
    import { Button } from "./ui/button";
    import LabelChip from "./LabelChip.svelte";

	type Task = { id: string, title: string, labels: { id: string, }[], progress: number, priority: "Low" | "Medium" | "High" | "Urgent", effort: string };
	type Label = { id: string, title: string, icon: string, color: string };

	let { task, user, labels }: { task: Task[], labels: Label[], user: { id: string, full_name: string } | undefined/* | ((id: string) => Promise<{ id: string, full_name: string }>)*/ } = $props();
</script>

<ContextMenu.Root>
	<ContextMenu.Trigger class="flex-1 px-2 py-2 gallery">
		<div id="left" class="gallery flex-1 gap-2">
			<Circle value={task.progress}/>
			<a href={`/tasks/${task.id}`} class="flex items-center min-w-32">
				<span class="text-sm tactile-text">
					{task.title}
				</span>
			</a>
			{#each task.labels as label}
				<LabelChip label={labels.find(l => l.id === label.id)}/>
			{/each}
		</div>
		<div id="right" class="gallery gap-2 pr-1">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame bg-primary-foreground rounded-md border">
					<svelte:component this={EFFORTS_ICONS[task.effort]} class="size-4"/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each EFFORTS as effort}
						<DropdownMenu.Item onclick={() => { task.effort = effort.value; /* TODO: post update */ }}>
							<svelte:component this={EFFORTS_ICONS[effort.value]} class="size-4 mr-2"/> {effort.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger class="size-6 frame bg-primary-foreground rounded-md border">
					<svelte:component this={PRIORITIES_ICONS[task.priority]} class="size-4"/>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					{#each PRIORITIES as priority}
						<DropdownMenu.Item onclick={() => { task.priority = priority.value; /* TODO: post update */ }}>
							<svelte:component this={PRIORITIES_ICONS[priority.value]} class="size-4 mr-2"/> {priority.label}
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
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item onclick={async () => await addPinned(task.id)}>Pin</ContextMenu.Item>
		<ContextMenu.Item onclick={async () => await addToDo(task.title)}>Add to ToDo's</ContextMenu.Item>
	</ContextMenu.Content>
</ContextMenu.Root>