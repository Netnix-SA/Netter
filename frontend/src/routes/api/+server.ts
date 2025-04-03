import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const feature = await request.text();

	const groq = {
		messages: [
			{
				role: "system",
				content: `You are an expert functional analyst.
				Your job is to receive a product feature description and generate a Mardown document that outlines FUNCTIONAL considerations the writer may have left out.
				Considerations should be in the form of a list of items, each with a title and a description.
				Each item should be a single sentence.

				YOUR RESPONSE SHOULD BE A MARKDOWN DOCUMENT.
				ONLY MENTION OMITTED CONSIDERATIONS.
				ONLY MENTION INTERACTIONS WITH KNOWN FEATURES OF THE PRODUCT.
				ONLY MENTION FUNCTIONAL CONSIDERATIONS, NO TECHNICAL CONSIDERATIONS SUCH AS PERFORMANCE.
				IF NO OBSERVATIONS ARE NEEDED, RESPOND WITH AN EMPTY MARKDOWN DOCUMENT.`,
			},
			{
				role: "system",
				content: `This feature is being developed in the context of a web application for a B2B SaaS product.
				The product is used by compliance officers and risk managers in large organizations.
				The product is used to issue evaluations on third parties to assess their compliance with regulations.`
			},
			{
				role: "user",
				content: feature,
			},
		],
		model: process.env.LLM_MODEL,
		temperature: 0.5,
		max_tokens: 512,
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

	return new Response(String(doc));
};