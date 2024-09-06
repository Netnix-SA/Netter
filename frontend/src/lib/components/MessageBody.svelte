<script lang="ts">
	import { client } from "@/state";
	import { CLASSES } from "@/global";

	let { body }: { body: string } = $props();

	function parseMessageBody(message: string): string[] {
	    // Define regex patterns for mentions, URLs, and text
	    const mentionPattern = /@\w+(:\w+)?/;
	    const urlPattern = /https?:\/\/\S+|www\.\S+/;
	    const textPattern = /[^@\s]+(?:\s+[^@\s]+)*/; // Matches contiguous words including spaces

	    // Combine patterns into one regex
	    const combinedPattern = new RegExp(`(${mentionPattern.source})|(${urlPattern.source})|(${textPattern.source})`, 'g');

	    // Find all matches
	    const matches = message.match(combinedPattern);

	    // If no matches found, return an empty array
	    if (!matches) {
	        return [];
	    }

	    return matches.map(t => {
			return {
				type: t.match(mentionPattern) ? 'mention' : t.match(urlPattern) ? 'url' : 'text',
				value: t
			};
		});
	}

	// Split on whitespace
	let tokens = parseMessageBody(body);
</script>

<div class="gallery h-6 gap-1">
	{#each tokens as { type, value }, i}
	{@const is_non_text = type !== 'text'}
		<span class="text-center text-sm text-primary" class:py-0.5={is_non_text} class:px-1={is_non_text} class:rounded={is_non_text} class:bg-muted={is_non_text}>
			{#if type === 'mention'}
				{@const mention = value.slice(1)}
				{#await client.api.metadata({ id: mention }).get()}
					<span class="animate-pulse">Loading...</span>
				{:then meta}
					<a href={CLASSES[mention.split(':')[0]].url(mention)}>@{meta.data.title}</a>
				{:catch error}
					<span class="text-muted-foreground">Error</span>
				{/await}
			{:else if type === 'url'}
				<a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
			{:else}
				{value}
			{/if}
		</span>
	{/each}
</div>
