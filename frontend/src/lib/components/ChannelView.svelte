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
    import { ChevronRight, X } from "lucide-svelte";

	type Message = { id: string, author: { id: string }; body: string, resolved?: boolean, question?: string, };

	let { channel, messages, users, onSend = async (body) => { await client.api.channels({ id: channel.id }).messages.post({ body }); } }: { channel: { id: string, }, messages: Promise<Message[]>, users: { id: string, full_name: string }[], onSend: (message: string) => void } = $props();

	let message = $state("");

	let question: Message | undefined = $state(undefined);
</script>

<ul class="flex-1 flex flex-col-reverse overflow-scroll">
	{#await messages}
		<div class="h-12 w-full bg-muted-foreground animate-pulse">

		</div>
	{:then messages}
		<!-- {#each messages as message}
		{@const user = users.find(u => u.id === message.author.id)}
			<li class="flex gap-3 border-t last:border-dashed">
				<ContextMenu.Root>
					<ContextMenu.Trigger class="flex-1 gallery px-4 py-2 gap-2">
						{#if message.question !== undefined}
							<ChevronRight class="size-4"/>
						{/if}
						<div id="left-col" class="flex flex-col h-full pt-2">
							<UserAvatar {user}/>
						</div>
						<div id="right-side" class="flex-1 flex flex-col">
							<div class="gallery gap-2">
								<span class="text-sm font-semibold">
									{user?.full_name}
								</span>
								{#if message.resolved !== undefined}
									<div class="frame rounded-full w-20 border text-xs h-5">
										<span style={message.resolved ? "filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1));" : "filter: drop-shadow(0px 0px 12px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 6px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 2px rgba(255, 60, 25, 1));"}>{message.resolved ? "Resolved" : "Unresolved"}</span>
									</div>
								{/if}
							</div>
							<span class="text-sm">
								{message.body}
							</span>
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content>
						<ContextMenu.Item onclick={() => { question = message; }}>Reply to</ContextMenu.Item>
						<ContextMenu.Item onclick={() => console.warn("Add to ToDo's")}>Add to ToDo's</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			</li>
		{/each} -->
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
		<div class="column flex-1">
			{#if question !== undefined}
				<div class="gallery gap-2">
					<span>
						Replying to:
						<span class="text-sm font-semibold max-w-32 truncate">{question.body}</span>
					</span>
					<button class="rounded size-5 border frame" onclick={() => { question = undefined; }}><X class="size-4"/></button>
				</div>
			{/if}
			<textarea id="message" placeholder="Type your message here..."
				class="appearance-none text-sm px-2 py-1 outline-none bg-black/50 text-foreground focus:outline-none border resize-y w-full focus-visible:ring-0 rounded-lg"
				bind:value={message}
			>
			</textarea>
		</div>
	</div>
	<div class="column justify-end">
		<Button type="submit" size="sm" onclick={async () => { await onSend(message); message = ""; }}>
			Send Message
			<CornerDownLeft class="size-3.5" />
		</Button>
	</div>
</div>