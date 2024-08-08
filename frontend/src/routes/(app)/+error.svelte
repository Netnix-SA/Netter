<script lang="ts">

    import { page } from "$app/stores";

</script>
<main class="page-backdrop">
    <h1 class="bg-gradient-to-b from-red-400 to-red-800 text-transparent bg-clip-text">
        {$page.error}
    </h1>
</main>