import OpenAI from "openai";

// Optional, but recommended: run on the edge runtime.
// See https://vercel.com/docs/concepts/functions/edge-functions
export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { prompt } = await req.json();

  // Request the OpenAI API for the response based on the prompt
  const response = await openai.chat.completions.create({
    // model: "gpt-3.5-turbo-1106",
    model: "gpt-4o-mini",
    response_format: {
      type: "json_object",
    },
    messages: [
      // {
      //   role: "system",
      //   content: "You are a helpful assistant.",
      // },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  if (response.choices.length === 0 || !response.choices[0].message.content) {
    return new Response("No data from OpenAI", {
      status: 500,
    });
  }

  const content = JSON.parse(response.choices[0].message.content);

  return Response.json(content);
}
