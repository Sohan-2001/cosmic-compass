'use server';

/**
 * @fileOverview Provides a brief astrological overview for the upcoming year based on birth details.
 *
 * - getYearlyOutlook - A function that generates the yearly astrological outlook.
 * - YearlyOutlookInput - The input type for the getYearlyOutlook function.
 * - YearlyOutlookOutput - The return type for the getYearlyOutlook function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YearlyOutlookInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The date of birth in ISO 8601 format (YYYY-MM-DD).'),
  birthTime: z
    .string()
    .describe('The time of birth in HH:mm format (24-hour clock).'),
  birthLocation: z
    .string()
    .describe('The location of birth (city, country).'),
});
export type YearlyOutlookInput = z.infer<typeof YearlyOutlookInputSchema>;

const YearlyOutlookOutputSchema = z.object({
  yearlyOverview: z
    .string()
    .describe(
      'A brief astrological overview for the upcoming year, highlighting key planetary influences and potential life themes.'
    ),
});
export type YearlyOutlookOutput = z.infer<typeof YearlyOutlookOutputSchema>;

export async function getYearlyOutlook(input: YearlyOutlookInput): Promise<YearlyOutlookOutput> {
  return yearlyOutlookFlow(input);
}

const yearlyOutlookPrompt = ai.definePrompt({
  name: 'yearlyOutlookPrompt',
  input: {schema: YearlyOutlookInputSchema},
  output: {schema: YearlyOutlookOutputSchema},
  prompt: `Given the birth details below, provide a brief astrological overview for the upcoming year, highlighting key planetary influences and potential life themes.

Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth Location: {{{birthLocation}}}

Consider major planetary transits and aspects to the natal chart.
Focus on potential life themes and areas of emphasis for the year.
Keep the overview concise and easy to understand.
`,
});

const yearlyOutlookFlow = ai.defineFlow(
  {
    name: 'yearlyOutlookFlow',
    inputSchema: YearlyOutlookInputSchema,
    outputSchema: YearlyOutlookOutputSchema,
  },
  async input => {
    const {output} = await yearlyOutlookPrompt(input);
    return output!;
  }
);
