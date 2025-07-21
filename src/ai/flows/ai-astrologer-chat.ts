// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Implements the AI Astrologer Chat feature, allowing users to engage in conversational astrology guidance.
 *
 * - aiAstrologerChat - The main function to initiate and manage the AI astrologer chat.
 * - AiAstrologerChatInput - The input type for the aiAstrologerChat function.
 * - AiAstrologerChatOutput - The output type for the aiAstrologerChat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiAstrologerChatInputSchema = z.object({
  message: z.string().describe('The user message to the AI astrologer.'),
});
export type AiAstrologerChatInput = z.infer<typeof AiAstrologerChatInputSchema>;

const AiAstrologerChatOutputSchema = z.object({
  response: z.string().describe('The AI astrologer’s response to the user message.'),
});
export type AiAstrologerChatOutput = z.infer<typeof AiAstrologerChatOutputSchema>;

export async function aiAstrologerChat(input: AiAstrologerChatInput): Promise<AiAstrologerChatOutput> {
  return aiAstrologerChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiAstrologerChatPrompt',
  input: {schema: AiAstrologerChatInputSchema},
  output: {schema: AiAstrologerChatOutputSchema},
  prompt: `You are a helpful AI astrologer. Your goal is to provide insightful and personalized astrological guidance.

Answer the following user question: {{{message}}}
  `,
});

const aiAstrologerChatFlow = ai.defineFlow(
  {
    name: 'aiAstrologerChatFlow',
    inputSchema: AiAstrologerChatInputSchema,
    outputSchema: AiAstrologerChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
