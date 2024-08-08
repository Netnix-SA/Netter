<script lang="ts">
    import { commands } from "@/state";

	commands.update(c => {
		c.push({ name: "Create", commands: [{ name: "One", do: () => {} }] });
		return c;
	});
</script>

<div class="flex-1 flex flex-col w-full divide-y">
	<header class="flex w-full px-6 h-10 items-center text-sm">
		My tasks
	</header>
	<main>
	</main>
</div>