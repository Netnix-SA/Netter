<script lang="ts">
    import UserAvatar from "@/components/UserAvatar.svelte";
    import { COLORS } from "@/global";

</script>
<main class="column gap-16">
    <section class="column w-[840px] gap-4">
        <h1 class="text-6xl tactile-text">Settings</h1>
        <div class="gallery gap-4">
            <UserAvatar user={{ id: "tex", full_name: "Facundo Villa", color: "Green/Light" }}/>
            <h2 class="tactile-text text-2xl">
                Facundo Villa
            </h2>
            <select class="bg-transparent rounded-lg border px-2 h-10">
                {#each COLORS as color}
                <option value={color.name}>{color.name}</option>
                {/each}
            </select>
        </div>
    </section>
    <section class="column w-full gap-4">
        <h2 class="text-4xl tactile-text">Integrations</h2>
        <div class="gallery gap-4 border rounded-lg h-24 px-6 py-4 justify-between">
            <h2 class="tactile-text text-2xl">
                GitHub
            </h2>
            <button class="gallery item-background h-10 w-32 rounded justify-evenly">
                <span class="tactile-text font-medium">Connect</span>
                <div class="size-2 rounded-full green-light bg-white"></div>
            </button>
        </div>
    </section>
</main>