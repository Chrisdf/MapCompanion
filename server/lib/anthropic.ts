import Anthropic from '@anthropic-ai/sdk';

// the newest Anthropic model is "claude-3-5-sonnet-20241022" which was released October 22, 2024
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseLocations(input: string): Promise<Array<{name: string, context?: string}>> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      system: `You are a hotel and location parsing assistant. Extract hotel names and their details from the input and return them in JSON format.
              For each hotel, identify:
              - name: The full hotel name
              - context: Any special notes or features mentioned (e.g., "highfloor available")

              Format the response as an array of objects with 'name' and optional 'context' fields.
              Return only valid JSON, no additional text.`,
      max_tokens: 1024,
      messages: [
        { role: 'user', content: input }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error("Unexpected response type from Anthropic API");
    }

    return JSON.parse(content.text);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("Failed to parse locations: " + error.message);
    }
    throw new Error("Failed to parse locations: Unknown error");
  }
}