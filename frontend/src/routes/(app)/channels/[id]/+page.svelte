<script lang="ts">
	import Paperclip from "lucide-svelte/icons/paperclip";
	import Mic from "lucide-svelte/icons/mic";
	import CornerDownLeft from "lucide-svelte/icons/corner-down-left";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Label } from "$lib/components/ui/label";
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import type { PageData } from "./$types";
    import UserAvatar from "@/components/UserAvatar.svelte";

	let { data }: { data: PageData } = $props();
</script>

<div id="chat" class="flex-1 h-full flex flex-col divide-y">
	<div id="chats" class="flex-1">
		<ul class="divide-y h-full flex flex-col place-content-end">
			{#await data.messages}
				Loading messages...
			{:then messages}
				{#each messages as message}
					<li class="flex px-4 py-2 gap-3">
						<div id="left-col" class="flex flex-col w-8 pt-2">
							<UserAvatar full_name={message.author}/>
						</div>
						<div id="right-side" class="flex-1">
							<span class="text-sm font-semibold">
								{message.author}
							</span>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									<span class="text-sm">
										{message.body}
									</span>
								</ContextMenu.Trigger>
								<ContextMenu.Content>
									<ContextMenu.Item>Profile</ContextMenu.Item>
									<ContextMenu.Item>Billing</ContextMenu.Item>
									<ContextMenu.Item>Team</ContextMenu.Item>
									<ContextMenu.Item>Subscription</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</div>
					</li>
				{/each}
			{/await}
		</ul>
	</div>
	<form id="inputs" class="bg-background overflow-hidden rounded-lg">
		<Label for="message" class="sr-only">Message</Label>
		<Textarea
			id="message"
			placeholder="Type your message here..."
			class="min-h-12 resize-none border-0 p-4 shadow-none focus-visible:ring-0"
		/>
		<div class="flex items-center py-2 px-3 pt-0">
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
</div>