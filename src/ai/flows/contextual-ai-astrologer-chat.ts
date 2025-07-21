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

const ContextualAiAstrologerChatInputSchema = z.object({
  message: z.string().describe('The user message to the AI astrologer.'),
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
      astrologyReading: z.string(),
    }),
  },
  output: { schema: ContextualAiAstrologerChatOutputSchema },
  prompt: `You are a helpful and deeply knowledgeable AI astrologer. Your goal is to provide insightful and personalized astrological guidance.

You have been provided with the user's astrological chart analysis. You MUST use this information to inform your answers.

=== User's Astrological Chart ===
{{{astrologyReading}}}
=================================

Answer the following user question based on their chart: {{{message}}}
  `,
});

const contextualAiAstrologerChatFlow = ai.defineFlow(
  {
    name: 'contextualAiAstrologerChatFlow',
    inputSchema: ContextualAiAstrologerChatInputSchema,
    outputSchema: ContextualAiAstrologerChatOutputSchema,
  },
  async (input) => {
    const astrologyReadingString = JSON.stringify(input.astrologyReading, null, 2);

    const { output } = await prompt({
      message: input.message,
      astrologyReading: astrologyReadingString,
    });
    return output!;
  }
);
