<script lang="ts">
	import CalendarIcon from "lucide-svelte/icons/calendar";
	import { type DateValue, DateFormatter, getLocalTimeZone, } from "@internationalized/date";
	import { cn } from "$lib/utils.js";
	import { Button } from "$lib/components/ui/button";
	import { Calendar } from "$lib/components/ui/calendar";
	import * as Popover from "$lib/components/ui/popover";
	
	const df = new DateFormatter("es-AR", {
		dateStyle: "long",
	});
	
	let { value = $bindable() }: { value: DateValue | undefined } = $props();
</script>
	
<Popover.Root>
	<Popover.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="outline" class={cn("w-[280px] justify-start text-left font-normal", !value && "text-muted-foreground")}>
				<CalendarIcon class="mr-2 size-4"/>
				{value ? df.format(value.toDate(getLocalTimeZone())) : "Select a date"}
			</Button>
		{/snippet}
	</Popover.Trigger>
	<Popover.Content class="w-auto p-0">
		<Calendar bind:value initialFocus/>
	</Popover.Content>
</Popover.Root>