interface RequestBody {
	userStoryName: string;
	description: string;
}

interface GeminiBody {
	candidates: Array<{
		content: {
			parts: Array<{ text: string }>;
		};
	}>;
}


import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use(cors())

app.get("/", c => {
	return c.json({ hello: "World"} )
})

export default app
/*
export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {


		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					"Allow": "GET, POST, PUT, DELETE, OPTIONS", // Adjust allowed methods as needed
					"Content-Type": "text/plain" // Optional: Set a content type for OPTIONS response
				}
			});
		}
		// } else {
		try {
			const body: RequestBody = await request.json();
			const { userStoryName, description } = body;
			console.log(userStoryName, description)
			// Construct the request payload
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

			const apiKey = env.API_KEY;
			const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

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
	}
	// },
};
*/
