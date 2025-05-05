import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const feature = await request.text();

	const groq = {
		messages: [
			{
				role: "system",
				content: `### Role
				You are an expert functional analyst.
				You provide insightful and deep observations on product feature descriptions for a functional analysists team.`,
			},
			{
				role: "system",
				content: `### Context
				This feature is being developed in the context of a web application for a B2B SaaS product.
				The product will be used by compliance officers and risk managers in large organizations to issue evaluations on third parties to assess their compliance with regulations.
				Evaluation templates are used by the compliance officers to design and issue evaluations on third parties. Evaluation templates are made up of questionnaire templates, which are made up of questions.
				Evaluations are issued from evaluation templates.`
			},
			{
				role: "system",
				content: `### Instructions
				Generate ONLY Markdown items informing the analyst defining the following feature of missing considerations in their specification.
				Each item should be a single line with a title and a single sentence description.`
			},
			{
				role: "user",
				content: `### Feature
				${feature}`,
			},
		],
		model: process.env.LLM_MODEL,
		temperature: 0.75,
		max_tokens: 512,
		top_p: 1,
		stop: null,
		stream: false,
	};

	console.log("GROQ", groq);

	const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
		},
		body: JSON.stringify(groq),
	});

	const json = await response.json();

	console.log("GROQ RESPONSE", json);

	const doc = json.choices[0].message.content;

	return new Response(String(doc));
};