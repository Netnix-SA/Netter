<script lang="ts">
	import type { Colors } from "../db/types";

	let { label }: { label: { icon: string, color: Colors, title: string } } = $props();
</script>

<div class="w-fit max-w-32 h-6 flex items-center rounded-md bg-slate-950 overflow-hidden item-background">
	<div class="h-full flex items-center justify-center min-w-5 w-5 border-r text-[0.75rem]" style="box-shadow:inset rgba(0, 0, 0, 0.5) 0px 0px 8px">
		{label?.icon}
	</div>
	<div class="gallery px-2">
		<span class="truncate flex-1 text-[0.75rem] tactile-text">
			{label?.title}
		</span>
	</div>
</div>