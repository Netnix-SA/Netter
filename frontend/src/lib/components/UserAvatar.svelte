<script lang="ts">
    let { user }: { user: { id: string, full_name: string } | undefined } = $props();

    let display = $derived(user ? user.full_name.split(" ").slice(0, 2).map((name) => name[0]).join("") : "?");
</script>

<a href={`/users/${user?.id ?? '404'}`} class="rounded border border-neutral-500 bg-green-500 size-6 flex items-center justify-center text-sm font-medium tracking-wide select-none">
    {display}
</a>