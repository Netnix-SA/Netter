<script lang="ts">
    import { CLASS_TO_ICON } from "@/global";
    import { MessageCircleQuestion } from "lucide-svelte";

    let { id }: { id: string } = $props();

    function buildUrl(clss: string, id: string) {
        if (clss === "Project") {
            return `/projects/${id}`;
        }

        if (clss === "User") {
            return `/users/${id}`;
        }

        if (clss === "Team") {
            return `/teams/${id}`;
        }

        if (clss === "Task") {
            return `/tasks/${id}`;
        }

        if (clss === "Repository") {
            return `/repositories/${id}`;
        }

        return "/";
    }

    let clss = $derived(id.split(':')[0] as "Project" | "User" | "Team" | "Task" | undefined);
    let name = $derived(id.split(':')[1]);
    let link = $derived(clss !== undefined ? buildUrl(clss, id) : "/");
</script>

<div class="gallery gap-2 h-10 rounded-lg border px-2">
    <svelte:component this={clss !== undefined ? CLASS_TO_ICON[clss] : MessageCircleQuestion} class="size-4"/>
    <a href={link} class="tactile-text">{id}</a>
</div>