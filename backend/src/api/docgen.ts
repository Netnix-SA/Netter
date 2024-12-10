import Surreal, { StringRecordId } from "surrealdb";
import type { ToDo } from "../db/types";
import { tToDoId } from "./schemas";

import { Elysia, t } from "elysia";

export const docgen = (db: Surreal) => new Elysia({ prefix: "/docgen", tags: ["DocGen"] })

.get("/", async () => {
	const collection = {
		"products": {
			"Netter": {
				"features": ["Create project", "Create task", "Assign task", "View projects", "View task"],
			},
		},
		"features": {
			"Create project": {
				"description": "As a user, I want to create a new project so that I can organize my tasks",
				"constraints": ["User must be an admin"],
				"dependencies": []
			},
			"Create task": {
				"description": "As a user, I want to create a new task so that I can track my work",
				"constraints": ["User must be a member of the project"],
				"dependencies": []
			},
			"Assign task": {
				"description": "As a user, I want to assign a task to a user so that they can work on it",
				"constraints": ["User must be a member of the project"],
				"dependencies": []
			},
			"View projects": {
				"description": "As a user, I want to view a list of project so that I can see what I'm working on",
				"constraints": ["User must be a member of the project"],
				"dependencies": []
			},
			"View task": {
				"description": "As a user, I want to view a task so that I can see what I need to do",
				"constraints": ["User must be a member of the project"],
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
		"description": "Assign a task to a user",
		"constraints": ["User must be a member of the project", "User must be logged in"],
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
				ONLY INCLUDE BEHAVIOUR THAT IS EXPLICITELY MENTIONED IN THE DESCRIPTION OR CONSTRAINTS.`,
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