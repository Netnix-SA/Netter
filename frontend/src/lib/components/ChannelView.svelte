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
    import { client } from "@/state";

	let { channel, messages, users, onSend = async (body) => { await client.api.channels({ id: channel.id }).messages.post({ body }); } }: { channel: { id: string, }, messages: Promise<{ author: { id: string }; body: string }[]>, users: { id: string, full_name: string }[], onSend: (message: string) => void } = $props();

	let message = $state("");
</script>

<ul class="flex-1 flex flex-col-reverse overflow-scroll">
	{#await messages}
		<div class="h-12 w-full bg-card-foreground animate-pulse">

		</div>
	{:then messages}
		{#each messages.toReversed() as message}
		{@const user = users.find(u => u.id === message.author.id)}
			<li class="flex gap-3 border-t last:border-dashed">
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
<div id="input-box" class="overflow-hidden rounded-t-lg bg-neutral-900 border-t px-3 py-2 gap-2 flex">
	<div id="left" class="flex flex-1 gap-2">
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button builders={[builder]} variant="ghost" size="icon">
					<Paperclip class="size-4" />
					<span class="sr-only">Attach file</span>
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content side="top">Attach File</Tooltip.Content>
		</Tooltip.Root>
		<textarea
			id="message"
			placeholder="Type your message here..."
			class="text-sm px-2 py-1 outline-none bg-transparent focus:outline-none border resize-y text-foreground w-full focus-visible:ring-0 rounded-lg"
			bind:value={message}
		/>
	</div>
	<div class="column justify-end">
		<Button type="submit" size="sm" onclick={async () => { await onSend(message); message = ""; }}>
			Send Message
			<CornerDownLeft class="size-3.5" />
		</Button>
	</div>
</div>