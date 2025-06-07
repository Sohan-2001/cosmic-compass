
'use server';

/**
 * @fileOverview Predicts significant life events and provides yearly astrological outlooks.
 *
 * - getYearlyPredictions - A function that handles the yearly prediction process.
 * - YearlyPredictionsInput - The input type for the getYearlyPredictions function.
 * - YearlyPredictionsOutput - The return type for the getYearlyPredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YearlyPredictionsInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The date of birth in ISO 8601 format (YYYY-MM-DD).'),
  birthTime: z
    .string()
    .describe('The time of birth in HH:mm format (24-hour clock).'),
  birthLocation: z.string().describe('The location of birth (e.g., city, country).'),
  currentFullDate: z.string().describe('The current full date (e.g., "July 26, 2024") to establish context for "this year", "next year".'),
  currentYear: z.number().describe('The current calendar year for context.'),
  nextYear: z.number().describe('The next calendar year for context.'),
  yearAfterNext: z.number().describe('The calendar year after the next for context.'),
});
export type YearlyPredictionsInput = z.infer<typeof YearlyPredictionsInputSchema>;

const YearlyPredictionsOutputSchema = z.object({
  thisYearOutlook: z.string().describe('Brief astrological overview for the current calendar year ({{{currentYear}}}).'),
  nextYearOutlook: z.string().describe('Brief astrological overview for the next calendar year ({{{nextYear}}}).'),
  yearAfterNextOutlook: z.string().describe('Brief astrological overview for the calendar year after next ({{{yearAfterNext}}}).'),
  generalSignificantEvents: z.string().optional().describe('Brief predictions of any other significant life events for the next 3 years not covered by the yearly summaries.'),
});
export type YearlyPredictionsOutput = z.infer<typeof YearlyPredictionsOutputSchema>;

export async function getYearlyPredictions(input: YearlyPredictionsInput): Promise<YearlyPredictionsOutput> {
  return yearlyPredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'yearlyPredictionsPrompt',
  input: {schema: YearlyPredictionsInputSchema},
  output: {schema: YearlyPredictionsOutputSchema},
  prompt: `You are an expert astrologer.
Given the birth details:
Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth Location: {{{birthLocation}}}

And the current date context: {{{currentFullDate}}}

Provide the following astrological insights. Ensure each outlook is brief:
1.  **This Year's Outlook ({{{currentYear}}}):** A brief astrological overview for the current calendar year {{{currentYear}}}, highlighting key planetary influences and potential life themes.
2.  **Next Year's Outlook ({{{nextYear}}}):** A brief astrological overview for the next calendar year {{{nextYear}}}, highlighting key planetary influences and potential life themes.
3.  **Year After Next's Outlook ({{{yearAfterNext}}}):** A brief astrological overview for the calendar year {{{yearAfterNext}}}, highlighting key planetary influences and potential life themes.
4.  **Other Significant Events (Optional):** Briefly mention any other particularly significant life events predicted for the next 3 years that aren't fully captured in the yearly summaries. If none, this can be omitted or stated as such.
`,
});

const yearlyPredictionsFlow = ai.defineFlow(
  {
    name: 'yearlyPredictionsFlow',
    inputSchema: YearlyPredictionsInputSchema,
    outputSchema: YearlyPredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
