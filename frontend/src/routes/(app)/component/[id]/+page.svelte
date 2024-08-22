<script lang="ts">
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();
</script>

<header class="gallery px-4 bg-primary-foreground w-full h-10 border-b">
	<h1 class="text-sm">{data.component.name}</h1>
</header>
<main class="flex-1 w-full">
	<div class="flex-1 p-24 column gap-4">
		<input type="text" class="text-4xl tactile-text font-bold" value={data.component.name}/>
		<textarea type="text" class="tactile-text" value={data.component.description}></textarea>
	</div>
</main>
