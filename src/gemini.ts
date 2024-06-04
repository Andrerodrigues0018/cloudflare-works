interface GeminiBody {
	candidates: Array<{
		content: {
			parts: Array<{ text: string }>;
		};
	}>;
}

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'

const app = new Hono()
app.use(cors())

app.get("/", c => {
	return c.json({ hello: "World" })
})

app.post('/gemini/pr', async (c) => {
	const body = await c.req.json()
	const { API_KEY } = env<{ API_KEY: string }>(c)
	try {
		const { userStoryName, description } = body;
		const defaultPrompt = `
	Gemini estou precisando descrever em inglês no codecommit as melhorias que fiz no meu projeto.

	Template de exemplo:

	ENG-53 - grant positive access response if course path contains legacy sufix
	<break>
	## Description
	This PR addresses issue ENG-53 created from the blocked content bug, on the old platform (data formation legacy).
	## Changes Made
	#### 1. Created a condition that send a positive access response for the front-end videoplayer.
	- verified the course path received in route payload, and if it contains the "legacy" sufix, it means that the content shall be accessible (based on 3.0 migration business rule).

	---

	Agora o que eu fiz:
	Em ${userStoryName} : ${description}`;

		const payload = {
			contents: [
				{
					parts: [{ text: defaultPrompt }],
				},
			],
		};

		const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			throw new Error(`Error: ${response.status} - ${response.statusText}`);
		}
		const data: GeminiBody = await response.json() as GeminiBody;

		const text = data.candidates[0].content.parts[0].text;
		const textSplited = text.split("<break>");
		const title = textSplited[0];
		const markdown = textSplited[1];

		return new Response(JSON.stringify({ title, markdown }), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error processing request:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
	return c.json(body)
})

export default app
