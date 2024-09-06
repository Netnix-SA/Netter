<script lang="ts">
	import Paperclip from "lucide-svelte/icons/paperclip";
	import { ArrowUp } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import * as ContextMenu from "$lib/components/ui/context-menu";
	import UserAvatar from "./UserAvatar.svelte";
    import { client } from "@/state";
    import { ChevronRight, X } from "lucide-svelte";
    import { addToDo } from "@/actions";
    import type { Snippet } from "svelte";

    import MessageBody from "@/components/MessageBody.svelte";

	type Message = { id: string, author: { id: string }; body: string, resolved?: boolean, question?: string, replies: Message[] };

	let { channel, messages, users, onSend = async (body, is_inquiry = false) => { await client.api.channels({ id: channel.id }).messages.post({ body, is_inquiry }); } }: { channel: { id: string, }, messages: Promise<Message[]>, users: { id: string, full_name: string }[], onSend: (message: string) => void } = $props();

	let pre_message = $state("");
	let tokens = $state([]);

	let question: Message | undefined = $state(undefined);

	function tokenize(body: string): ({ prop: string, snip: Snippet<[{ title: string, dodo: (v:string) => void, active: boolean }]> } | { prop: string, snip: Snippet<[{ t: string, dodo: (v:string) => void, active: boolean }]> })[] {
		// Define regex patterns for mentions, URLs, and text
		const mentionPattern = /@\w+(:\w+)?/;
		const urlPattern = /https?:\/\/\S+|www\.\S+/;
		const textPattern = /[^@\s]+(?:\s+[^@\s]+)*/; // Matches contiguous words including spaces

		// Combine patterns into one regex
		const combinedPattern = new RegExp(`(${mentionPattern.source})|(${urlPattern.source})|(${textPattern.source})`, 'g');

		// Find all matches
		const tokens = body.match(combinedPattern);

		// If no matches found, return an empty array
		if (!tokens) {
			return [{ prop: "", snip: text, dodo: (v: string) => { pre_message += v; } }];
		}

		const snippets = [];

		for (let i = 0; i < tokens.length; i++) {
			let token = tokens[i];

			if (token.startsWith("@")) {
				const oid = token.slice(1, -1);

				snippets.push({ prop: token, snip: mention, dodo: (v: string) => { pre_message = ""; } });
			} else {
				snippets.push({ prop: token, snip: text, dodo: (v: string) => { pre_message += v; } });
			}
		}

		if (snippets.length === 0) {
			snippets.push({ prop: "", snip: text, dodo: (v: string) => { pre_message += v; } });
		}

		return snippets;
	}
</script>

{#snippet text(t: string, dodo: (v: string) => void)}
	<input bind:value={pre_message}/>
{/snippet}

{#snippet mention(title: string, dodo: (v: string) => void, active: boolean)}
{@const results = client.api.get({ query: { text: title.replace("@", "") } })}
<div class="relative">
	{#if active}
	<div class="absolute bottom-6 min-w-64 bg-primary-foreground rounded-md min-h-32 column border z-10 shadow">
		<div class="text-md border-b px-2 h-8 gallery">
			{title}
		</div>
		{#await results}
			Loading...
		{:then re}
			{#each re.data as entry}
				<ul class="flex-1">
					<option class="gallery px-2 h-6 border-b" onclick={() => dodo(`@${entry.id}`)}>
						{entry.title}
					</option>
				</ul>
			{:else}
				<div class="frame flex-1 w-full h-full text-muted-foreground/50 text-sm">
					<span>
					No results
					</span>
				</div>
			{/each}
		{/await}
	</div>
	{/if}
	<span class="text-sm font-semibold text-red-400 rounded bg-primary-foreground p-1">
		{title}
	</span>
</div>
{/snippet}

{#snippet link(title: string, href: string)}
	<a {href}>
		{title}
	</a>
{/snippet}

{#snippet message_snippet(message: Message, dodo: (v: string) => void)}
{@const user = users.find(u => u.id === message.author.id)}
<ContextMenu.Root>
	<ContextMenu.Trigger class="flex-1 gallery px-4 py-2 gap-2">
		<!-- {#if message.question !== undefined}
			<ChevronRight class="size-4"/>
		{/if} -->
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
						<span class="select-none" style={message.resolved ? "filter: drop-shadow(0px 0px 12px rgba(0, 255, 163, 1)) drop-shadow(0px 0px 6px rgba(0, 255, 163, 1));" : "filter: drop-shadow(0px 0px 12px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 6px rgba(255, 60, 25, 1)) drop-shadow(0px 0px 2px rgba(255, 60, 25, 1));"}>{message.resolved ? "Resolved" : "Unresolved"}</span>
					</div>
				{/if}
			</div>
			{#if message.question !== undefined}
			<div class="gallery gap-1">
			<span class="text-sm text-muted-foreground">
				Replying to:
			</span>
			<span class="text-sm text-muted-foreground">
				{message.question}
			</span>
			</div>
			{/if}
			<MessageBody body={message.body}/>
		</div>
	</ContextMenu.Trigger>
	<ContextMenu.Content>
		<ContextMenu.Item onclick={() => { question = message; }}>Reply to</ContextMenu.Item>
		<ContextMenu.Item onclick={async () => await addToDo(message.body)}>Add to ToDo's</ContextMenu.Item>
		{#if message.resolved !== undefined}
			<ContextMenu.Item onclick={() => { question = message; }}>Mark as resolved</ContextMenu.Item>
		{/if}
	</ContextMenu.Content>
</ContextMenu.Root>
{/snippet}

<ul class="flex-1 flex flex-col-reverse overflow-scroll">
	{#await messages}
		<div class="h-12 w-full bg-muted-foreground animate-pulse">

		</div>
	{:then msgs}
		{#each msgs as message}
			<li class="flex gap-3 border-t last:border-dashed">
				{@render message_snippet(message)}
			</li>
		{/each}
	{/await}
</ul>
<div id="input-box" class="rounded-t-lg bg-neutral-900 border-t px-3 py-2 gap-2 flex">
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
			<!-- <textarea id="message" placeholder="Type your message here..."
				class="appearance-none text-sm px-2 py-1 outline-none bg-black/50 text-foreground focus:outline-none border resize-y w-full focus-visible:ring-0 rounded-lg"
				bind:value={message}
			>
			</textarea> -->
			<div id="message" class="appearance-none text-sm px-2 py-1 outline-none bg-black/50 text-foreground focus:outline-none border resize-y w-full focus-visible:ring-0 rounded-lg">
				{#each tokenize(pre_message) as { snip, prop, dodo }}
					{@render snip(prop, dodo, true)}
				{/each}
			</div>
		</div>
	</div>
	<div class="column justify-end">
		<button class="size-8 frame rounded-md item-background group transition-all" onclick={async (e) => { await onSend(pre_message, e.getModifierState("Alt")); pre_message = ""; }}>
			<ArrowUp class="size-4 group-hover:green-light transition-all"/>
		</button>
	</div>
</div>
