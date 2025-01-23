<script lang="ts">
	import Paperclip from "lucide-svelte/icons/paperclip";
	import { ArrowUp } from "lucide-svelte";
	import { Button } from "$lib/components/ui/button";
	import * as Tooltip from "$lib/components/ui/tooltip";
    import { client } from "@/state";
    import { ChevronRight, X } from "lucide-svelte";
    import { addToDo } from "@/actions";
    import type { Snippet } from "svelte";

    import MessageBody from "@/components/MessageBody.svelte";
    import { flyAndScale } from "@/utils";
    import Message from "./Message.svelte";

	let { channel, messages, users, onSend = async (body, is_inquiry = false) => { await client.api.channels({ id: channel.id }).messages.post({ body, is_inquiry }); } }: { channel: { id: string, }, messages: Promise<Message[]>, users: { id: string, full_name: string }[], onSend: (message: string) => void } = $props();

	let pre_message = $state("");

	let question: Message | undefined = $state(undefined);

	import { Carta, MarkdownEditor } from "carta-md";
	import DOMPurify from "isomorphic-dompurify";
	import "carta-md/default.css";

	const carta = new Carta({
		sanitizer: DOMPurify.sanitize,
		rendererDebounce: 10,
	});

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
	<div class:hidden={!active} class="absolute bottom-6 min-w-64 bg-primary-foreground rounded-md min-h-32 column border z-10 shadow-sm" transition:flyAndScale>
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
	<input class="text-sm font-semibold text-red-400 rounded bg-primary-foreground p-1" bind:value={pre_message}/>
</div>
{/snippet}

{#snippet link(title: string, href: string)}
	<a {href}>
		{title}
	</a>
{/snippet}

<ul class="flex-1 flex flex-col-reverse overflow-scroll">
	{#await messages}
		<div class="h-12 w-full bg-muted-foreground animate-pulse">

		</div>
	{:then msgs}
		{#each msgs as message}
			<li class="flex gap-3 border-t last:border-dashed">
				<Message {message}/>
			</li>
		{/each}
	{/await}
</ul>
<div id="input-box" class="rounded-t-lg bg-neutral-900 border-t px-3 py-2 gap-2 flex">
	<div id="left" class="flex flex-1 gap-2">
		<Tooltip.Root>
			<Tooltip.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="ghost" size="icon">
						<Paperclip class="size-4" />
						<span class="sr-only">Attach file</span>
					</Button>
				{/snippet}
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
		</div>
		<MarkdownEditor {carta}/>
	</div>
	<div class="column justify-end">
		<button class="size-8 frame rounded-md item-background group transition-all" onclick={async (e) => { await onSend(pre_message, e.getModifierState("Alt")); pre_message = ""; }}>
			<ArrowUp class="size-4 group-hover:green-light transition-all"/>
		</button>
	</div>
</div>


<style>
	/* Set your monospace font (Required to have the editor working correctly!) */
	:global(.carta-font-code) {
		font-family: 'FiraSans', monospace;
		font-size: 1.1rem;
	}
</style>