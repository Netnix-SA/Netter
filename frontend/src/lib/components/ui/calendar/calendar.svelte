<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	// import * as Calendar from "./index.js";
	import { cn } from "$lib/utils.js";

	type $$Props = CalendarPrimitive.Props;
	type $$Events = CalendarPrimitive.Events;

	export let value: $$Props["value"] = undefined;
	export let placeholder: $$Props["placeholder"] = undefined;
	export let weekdayFormat: $$Props["weekdayFormat"] = "short";

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<CalendarPrimitive.Root
	bind:value
	bind:placeholder
	{weekdayFormat}
	class={cn("p-3", className)}
	{...$$restProps}
	on:keydown
>
	{#snippet children({ months, weekdays })}
		<CalendarPrimitive.Header>
			<CalendarPrimitive.PrevButton />
			<CalendarPrimitive.Heading />
			<CalendarPrimitive.NextButton />
		</CalendarPrimitive.Header>
		{#each months as month}
			<CalendarPrimitive.Grid>
				<CalendarPrimitive.GridHead>
					<CalendarPrimitive.GridRow class="flex">
						{#each weekdays as weekday}
							<CalendarPrimitive.HeadCell>
								{weekday.slice(0, 2)}
							</CalendarPrimitive.HeadCell>
						{/each}
					</CalendarPrimitive.GridRow>
				</CalendarPrimitive.GridHead>
				<CalendarPrimitive.GridBody>
					{#each month.weeks as weekDates}
						<CalendarPrimitive.GridRow class="mt-2 w-full">
							{#each weekDates as date}
								<CalendarPrimitive.Cell {date} month={month.value}>
									<CalendarPrimitive.Day/>
								</CalendarPrimitive.Cell>
							{/each}
						</CalendarPrimitive.GridRow>
					{/each}
				</CalendarPrimitive.GridBody>
			</CalendarPrimitive.Grid>
		{/each}
	{/snippet}
</CalendarPrimitive.Root>
