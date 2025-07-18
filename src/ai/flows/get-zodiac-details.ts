'use server';

/**
 * @fileOverview An AI agent for providing detailed information about zodiac signs.
 *
 * - getZodiacDetails - A function that fetches detailed information for a given zodiac sign.
 * - GetZodiacDetailsInput - The input type for the getZodiacDetails function.
 * - GetZodiacDetailsOutput - The return type for the getZodiacDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetZodiacDetailsInputSchema = z.object({
  sign: z.string().describe('The name of the zodiac sign (e.g., "Aries", "Taurus").'),
});
export type GetZodiacDetailsInput = z.infer<typeof GetZodiacDetailsInputSchema>;

const GetZodiacDetailsOutputSchema = z.object({
  sign: z.string().describe('The zodiac sign.'),
  symbol: z.string().describe('The symbol of the zodiac sign (e.g., The Ram).'),
  element: z.string().describe('The element associated with the sign (e.g., Fire).'),
  modality: z.string().describe('The modality of the sign (e.g., Cardinal).'),
  rulingPlanet: z.string().describe('The ruling planet of the sign.'),
  strengths: z.array(z.string()).describe('A list of key strengths.'),
  weaknesses: z.array(z.string()).describe('A list of key weaknesses.'),
  personality: z.string().describe('A detailed description of the personality traits.'),
  loveAndRelationships: z.string().describe('How the sign behaves in love and relationships.'),
  career: z.string().describe('Career paths and work habits suitable for the sign.'),
});
export type GetZodiacDetailsOutput = z.infer<typeof GetZodiacDetailsOutputSchema>;

export async function getZodiacDetails(
  input: GetZodiacDetailsInput
): Promise<GetZodiacDetailsOutput> {
  return getZodiacDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getZodiacDetailsPrompt',
  input: {schema: GetZodiacDetailsInputSchema},
  output: {schema: GetZodiacDetailsOutputSchema},
  prompt: `You are an expert astrologer. Provide a detailed profile for the zodiac sign: {{{sign}}}.

  Your response should be comprehensive, covering all aspects of the output schema.
  - symbol: The representative symbol (e.g., The Ram for Aries).
  - element: Fire, Earth, Air, or Water.
  - modality: Cardinal, Fixed, or Mutable.
  - rulingPlanet: The main ruling planet.
  - strengths: A list of 3-5 positive keywords.
  - weaknesses: A list of 3-5 challenging keywords.
  - personality: A detailed paragraph about their core personality.
  - loveAndRelationships: A detailed paragraph about how they approach love, romance, and partnership.
  - career: A detailed paragraph about their professional strengths and ideal career paths.
  `,
});

const getZodiacDetailsFlow = ai.defineFlow(
  {
    name: 'getZodiacDetailsFlow',
    inputSchema: GetZodiacDetailsInputSchema,
    outputSchema: GetZodiacDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
