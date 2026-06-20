import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateCode(
  prompt: string,
  model: "claude-3-5-sonnet-20241022" | "claude-3-5-opus-20241022" = "claude-3-5-sonnet-20241022"
) {
  const { systemPrompt } = await import("@/lib/prompts");

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extract text from response
  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return content.text;
}

export async function generateCodeStream(
  prompt: string,
  model: "claude-3-5-sonnet-20241022" | "claude-3-5-opus-20241022" = "claude-3-5-sonnet-20241022"
) {
  const { systemPrompt } = await import("@/lib/prompts");

  const stream = await client.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return stream;
}
