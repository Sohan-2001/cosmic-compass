'use server';

/**
 * @fileOverview An AI agent for determining a zodiac sign from a birth date.
 *
 * - getZodiacFromDate - A function that returns the zodiac sign for a given birth date.
 * - GetZodiacFromDateInput - The input type for the getZodiacFromDate function.
 * - GetZodiacFromDateOutput - The return type for the getZodiacFromDate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetZodiacFromDateInputSchema = z.object({
  birthDate: z.string().describe('The date of birth (e.g., YYYY-MM-DD).'),
});
export type GetZodiacFromDateInput = z.infer<typeof GetZodiacFromDateInputSchema>;

const GetZodiacFromDateOutputSchema = z.object({
  zodiacSign: z.string().describe('The calculated Zodiac sign (e.g., "Aries", "Taurus").'),
});
export type GetZodiacFromDateOutput = z.infer<typeof GetZodiacFromDateOutputSchema>;

export async function getZodiacFromDate(
  input: GetZodiacFromDateInput
): Promise<GetZodiacFromDateOutput> {
  return getZodiacFromDateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getZodiacFromDatePrompt',
  input: {schema: GetZodiacFromDateInputSchema},
  output: {schema: GetZodiacFromDateOutputSchema},
  prompt: `You are an expert astrologer. Based on the following birth date, determine the user's Zodiac sun sign.

  Birth Date: {{{birthDate}}}

  Return only the name of the zodiac sign.`,
});

const getZodiacFromDateFlow = ai.defineFlow(
  {
    name: 'getZodiacFromDateFlow',
    inputSchema: GetZodiacFromDateInputSchema,
    outputSchema: GetZodiacFromDateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
