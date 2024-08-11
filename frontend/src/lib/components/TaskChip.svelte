<script lang="ts">
    type Task = { id: string, title: string, status: string };

    let { id, tasks, }: { id: string, tasks: Task[] } = $props();

    let task: Task | undefined = $derived(tasks.find(t => t.id === id));
</script>

<a href={`/tasks/${id}`} class="w-full h-10 rounded-md gallery px-2 gap-2 border transition-all">
    <span class="text-xs text-red-500">{task?.status.slice(0, 3)}</span>
    <span class="text-xs tactile-text">{task?.title}</span>
</a>