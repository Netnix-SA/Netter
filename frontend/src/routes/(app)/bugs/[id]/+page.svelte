<script lang="ts">
	import Separator from "@/components/ui/separator/separator.svelte";
import type { PageData } from "./$types";
    import AnyChip from "@/components/AnyChip.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div class="frame p-12 gap-8">
	<div id="left" class="column gap-4">
		<div class="gallery gap-4">
			<div class="column">
				<span class="text-muted-foreground text-sm select-all">{"#"}{data.bug.id}</span>
				<input class="tactile-text text-4xl font-medium flex-1" bind:value={data.bug.title}/>
			</div>
			<Separator orientation="vertical"/>
			<div class="column w-32">
				<span class="text-muted-foreground text-sm">Status</span>
				<span class="" style={data.bug.resolved ? "filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1));" : "filter: drop-shadow(0px 0px 12px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 6px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 2px rgba(255, 60, 25, 1));"}>{data.bug.resolved ? "Resolved" : "Open"}</span>
				<!-- <span class="">{"Resolved"}</span> -->
			</div>
		</div>
		<Separator/>
		<div class="gallery gap-4">
			<div class="column">
				<span class="text-muted-foreground text-sm">Registered</span>
				<span class="tactile-text">{"2024/07/29"}</span>
			</div>
			<Separator orientation="vertical"/>
			<div class="column">
				<span class="text-muted-foreground text-sm">Release</span>
				<span class="tactile-text">{"v1.0.3"}</span>
			</div>
		</div>
		<Separator/>
		<div class="flex gap-4">
			<div class="column flex-1 gap-1">
				<span class="text-muted-foreground text-sm">Affected applications</span>
				<ul class="h-64 rounded-lg">
					{#each data.bug.impact.applications as application}
						<AnyChip id={application.id}/>
					{/each}
				</ul>
			</div>
			<Separator orientation="vertical"/>
			<div class="column flex-1 gap-1">
				<span class="text-muted-foreground text-sm">Affected features</span>
				<ul class="h-64 rounded-lg">
					{#each data.bug.impact.features as feature}
						<AnyChip id={feature.id}/>
					{/each}
				</ul>
			</div>
		</div>
	</div>
	<Separator orientation="vertical"/>
	<div id="right" class="column gap-4">
		<div class="column">
			<span class="text-muted-foreground text-sm">Description</span>
			<textarea class="tactile-text h-[8lh]" bind:value={data.bug.description}/>
		</div>
	</div>
</div>