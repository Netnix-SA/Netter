import type { Efforts } from "./db/types";

export function parse_mentions(body: string): string[] {
	const mentions = body.match(/(^|\s)@[:a-zA-Z0-9_]+/g) || [];
	// Remove leading space and/or @, which may be present in the match
	return mentions.map((mention) => mention.replace(/(^|\s)@/, ""));
}

export const effort_to_time = (effort: Efforts) => {
	switch (effort) {
		case "Hour": return 1;
		case "Hours": return 6;
		case "Day": return 8;
		case "Days": return 8 * 4;
		case "Week": return 8 * 5;
	}
};