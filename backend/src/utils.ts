export function parse_mentions(body: string): string[] {
	const mentions = body.match(/(^|\s)@[:a-zA-Z0-9_]+/g) || [];
	// Remove leading space and/or @, which may be present in the match
	return mentions.map((mention) => mention.replace(/(^|\s)@/, ""));
}
