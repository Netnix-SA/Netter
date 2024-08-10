<script lang="ts">
    import * as ContextMenu from "$lib/components/ui/context-menu";
    import UserAvatar from "./UserAvatar.svelte";

    let { task, user }: { task: { id: string, title: string }, user: { id: string, full_name: string } | undefined/* | ((id: string) => Promise<{ id: string, full_name: string }>)*/ } = $props();
</script>

<ContextMenu.Root>
    <ContextMenu.Trigger class="flex-1 px-6 py-2 gallery">
        <div id="left" class="gallery flex-1">
            <a href={`/tasks/${task.id}`} class="flex items-center">
                <span class="text-sm tactile-text">
                    {task.title}
                </span>
            </a>
        </div>
        <div id="right" class="gallery gap-2">
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
        <ContextMenu.Item onclick={() => console.warn("Add to ToDo's")}>Add to ToDo's</ContextMenu.Item>
    </ContextMenu.Content>
</ContextMenu.Root>