<script lang="ts">
	import Paperclip from "lucide-svelte/icons/paperclip";
	import Mic from "lucide-svelte/icons/mic";
	import CornerDownLeft from "lucide-svelte/icons/corner-down-left";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import UserAvatar from "./UserAvatar.svelte";

	let { messages, users }: { messages: Promise<{ author: { id: string }; body: string }[]>, users: { id: string, full_name: string }[] } = $props();
</script>

<ul class="divide-y h-full flex flex-col place-content-end">
	{#await messages}
		<div class="h-12 w-full bg-card animate-pulse">

		</div>
	{:then messages}
		{#each messages as message}
		{@const user = users.find(u => u.id === message.author.id)}
			<li class="flex gap-3">
				<ContextMenu.Root>
					<ContextMenu.Trigger class="flex-1 gallery px-4 py-2 gap-2">
						<div id="left-col" class="flex flex-col h-full pt-2">
							<UserAvatar {user}/>
						</div>
						<div id="right-side" class="flex-1 flex flex-col">
							<span class="text-sm font-semibold">
								{user?.full_name}
							</span>
							<span class="text-sm">
								{message.body}
							</span>
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item onclick={() => console.warn("Add to ToDo's")}>Add to ToDo's</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</li>
		{/each}
	{/await}
</ul>
<form id="inputs" class="overflow-hidden rounded-lg item-background px-3 py-2">
	<Label for="message" class="sr-only">Message</Label>
	<Textarea
		id="message"
		placeholder="Type your message here..."
		class="resize-none border-0 shadow-none focus-visible:ring-0"
	/>
	<div class="flex items-center">
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" size="icon">
					<Paperclip class="size-4" />
					<span class="sr-only">Attach file</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="top">Attach File</Tooltip.Content>
		</Tooltip.Root>
		<Button type="submit" size="sm" class="ml-auto gap-1.5">
			Send Message
			<CornerDownLeft class="size-3.5" />
		</Button>
	</div>
</form>