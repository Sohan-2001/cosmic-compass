
// src/ai/flows/contextual-ai-astrologer-chat.ts
'use server';

/**
 * @fileOverview Implements a contextual AI Astrologer Chat, using user-provided data for personalized responses.
 *
 * - contextualAiAstrologerChat - The main function for the contextual chat.
 * - ContextualAiAstrologerChatInput - The input type for the function.
 * - ContextualAiAstrologerChatOutput - The output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { type InterpretAstrologicalChartOutput } from './interpret-astrological-chart';

const ContextualAiAstrologerChatInputSchema = z.object({
  message: z.string().describe('The user message to the AI astrologer.'),
  chatHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .describe(
      'Previous messages in the chat. Should be an array of objects with role and content keys.'
    ),
  astrologyReading: z.any().describe('The user\'s astrological chart reading.'),
});
export type ContextualAiAstrologerChatInput = z.infer<typeof ContextualAiAstrologerChatInputSchema>;

const ContextualAiAstrologerChatOutputSchema = z.object({
  response: z.string().describe('The AI astrologer’s response to the user message.'),
});
export type ContextualAiAstrologerChatOutput = z.infer<
  typeof ContextualAiAstrologerChatOutputSchema
>;

export async function contextualAiAstrologerChat(
  input: ContextualAiAstrologerChatInput
): Promise<ContextualAiAstrologerChatOutput> {
  return contextualAiAstrologerChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contextualAiAstrologerChatPrompt',
  input: {
    schema: z.object({
      message: z.string(),
      chatHistory: z.any().optional(),
      astrologyReading: z.string(),
    }),
  },
  output: { schema: ContextualAiAstrologerChatOutputSchema },
  prompt: `You are a helpful and deeply knowledgeable AI astrologer. Your goal is to provide insightful and personalized astrological guidance in a conversational format, using the user's specific data.

You have been provided with the user's astrological chart analysis. You MUST use this information to inform your answers. When a user asks a question, refer to their specific chart details to provide a tailored response.

=== User's Astrological Chart ===
{{{astrologyReading}}}
=================================

{{#if chatHistory}}
Here is the conversation history so far. Use it to understand the context of the user's message.
{{#each chatHistory}}
{{this.role}}: {{this.content}}
{{/each}}
{{/if}}

Current user message: {{{message}}}

Please provide a helpful and insightful response, directly referencing the user's provided data where relevant. Keep the response length appropriate for a chat conversation.
  `,
});

const contextualAiAstrologerChatFlow = ai.defineFlow(
  {
    name: 'contextualAiAstrologerChatFlow',
    inputSchema: ContextualAiAstrologerChatInputSchema,
    outputSchema: ContextualAiAstrologerChatOutputSchema,
  },
  async (input) => {
    // Convert context objects to JSON strings for the prompt
    const astrologyReadingString = JSON.stringify(input.astrologyReading, null, 2);

    const { output } = await prompt({
      message: input.message,
      chatHistory: input.chatHistory,
      astrologyReading: astrologyReadingString,
    });
    return output!;
  }
);
