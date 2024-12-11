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

export const generate_gherkin = async (feature: any) => {
	const groq = {
		messages: [
			{
				role: "system",
				content: `You are an expert functional analyst.
				Your job is to receive a product feature description and generate a Gherkin document that describes the behavior of the feature in plain English and exercise the edge cases and constraints described in the feature.
				The document should include clear steps that will allow a developer to implement the feature and test it.
				DON'T RETURN ANYTHING ELSE THAN THE GHERKIN DOCUMENT.
				DO NOT CREATE SCENARIOS THAT REFER TO FUNCTIONALITY NOT MENTIONED IN THE FEATURE DESCRIPTION.
				DO NOT CREATE SCENARIOS THAT REFER TO FUNCTIONALITY NOT DISALLOWED BY THE FEATURE CONSTRAINTS.`,
			},
			{
				role: "user",
				content: JSON.stringify(feature),
			},
		],
		model: "llama3-8b-8192",	
		temperature: 0.5,
		max_tokens: 2048,
		top_p: 1,
		stop: null,
		stream: false,
	};

	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
		},
		body: JSON.stringify(groq),
	});

	const json = await response.json();

	const doc = json.choices[0].message.content;

	return doc;
};

export const generate_product_brief = async (collection: any) => {
	const groq = {
		messages: [
			{
				role: "system",
				content: `You are an expert functional analyst.
				Your job is to receive a collection of products, their features and components and generate a Markdown document that documents
				the purpose of these products, what their features are, what they do and what components these products and features depend on.
				The document should be structured in a way that is easy to read for non-technical users who are not familiar with the products.
				DON'T RETURN ANYTHING ELSE THAN THE MARKDOWN DOCUMENT.
				DON'T INCLUDE ANY FUNCTIONALITY THAT IS NOT DESCRIBED IN THE COLLECTION.`,
			},
			{
				role: "user",
				content: JSON.stringify(collection),
			},
		],
		model: "llama3-8b-8192",	
		temperature: 0.5,
		max_tokens: 2048,
		top_p: 1,
		stop: null,
		stream: false,
	};

	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
		},
		body: JSON.stringify(groq),
	});

	const json = await response.json();

	const doc = json.choices[0].message.content;

	return doc;
};