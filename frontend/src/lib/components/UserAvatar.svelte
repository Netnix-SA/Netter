<script lang="ts">
    let { user }: { user: { id: string, full_name: string } | undefined } = $props();

    let display = $derived(user ? user.full_name.split(" ").slice(0, 2).map((name) => name[0]).join("") : "?");
</script>

<a href={`/users/${user?.id ?? '404'}`} class="rounded border border-neutral-500 green-background size-6 flex items-center justify-center text-sm font-medium tracking-wide select-none">
    {display}
</a>

<style>
 .green-background {
    background-image: linear-gradient(to bottom, hsl(80, 50, 90), hsl(100, 70, 70));
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12), 0 2px 6px black;
  }
</style>