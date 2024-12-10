import Surreal, { StringRecordId } from "surrealdb";
import type { ToDo } from "../db/types";
import { tToDoId } from "./schemas";

import { Elysia, t } from "elysia";

export const docgen = (db: Surreal) => new Elysia({ prefix: "/docgen", tags: ["DocGen"] })

.get("/", async () => {
	const collection = {
		"products": {
			"Netter": {
				"features": ["Create project", "Create task", "Assign task", "View project", "View task"],
			},
		},
		"features": {
			"Create project": {
				"purpose": "Create a new project",
				"dependencies": []
			},
			"Create task": {
				"purpose": "Create a new task",
				"dependencies": []
			},
			"Assign task": {
				"purpose": "Assign a task to a user",
				"constraints": ["User must be a member of the project"],
				"dependencies": []
			},
			"View project": {
				"purpose": "View a project",
				"dependencies": []
			},
			"View task": {
				"purpose": "View a task",
				"dependencies": []
			},
		},
		"components": {
			"SurrealDB": {
				"purpose": "Main database that powers the application",
				"dependencies": []
			},
			"Netter API": {
				"purpose": "JavaScript backend API for the Netter web application",
				"dependencies": ["SurrealDB", "Groq API"]
			},
			"Netter Frontend": {
				"purpose": "Svelte frontend for the Netter web application",
				"dependencies": ["Netter API"]
			},
			"Groq API": {
				"purpose": "External LLM API for generating documentation",
				"dependencies": []
			},
		},
	};

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
})

.get("/gherkin", async () => {
	const feature = {
		"name": "Assign task",
		"purpose": "Assign a task to a user",
		"constraints": ["User must be a member of the project"],
		"dependencies": []
	};

	const groq = {
		messages: [
			{
				role: "system",
				content: `You are an expert functional analyst.
				Your job is to receive a product feature description and generate a Gherkin document that describes the behavior of the feature in plain English and exercise the edge cases and constraints described in the feature.
				The document should include clear steps that will allow a developer to implement the feature and test it.
				DON'T RETURN ANYTHING ELSE THAN THE GHERKIN DOCUMENT.
				DON'T CREATE SCENARIOS THAT DON'T REFER TO FUNCTIONALITY EXPLICITELY ALLOWED OR DENIED IN THE FEATURE DESCRIPTION AND CONSTRAINTS.`,
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
});