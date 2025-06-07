'use server';

/**
 * @fileOverview Provides a personalized astrological forecast for the current and upcoming month based on birth details.
 *
 * - getMonthlyForecast - A function that returns the monthly forecast.
 * - MonthlyForecastInput - The input type for the getMonthlyForecast function.
 * - MonthlyForecastOutput - The return type for the getMonthlyForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MonthlyForecastInputSchema = z.object({
  birthDate: z.string().describe('The date of birth (YYYY-MM-DD).'),
  birthTime: z.string().describe('The time of birth (HH:mm).'),
  birthLocation: z.string().describe('The location of birth (e.g., City, Country).'),
  currentDate: z.string().describe('The current date (YYYY-MM-DD).'),
});
export type MonthlyForecastInput = z.infer<typeof MonthlyForecastInputSchema>;

const MonthlyForecastOutputSchema = z.object({
  monthlyForecast: z.string().describe('A personalized astrological forecast for the current and upcoming month.'),
});
export type MonthlyForecastOutput = z.infer<typeof MonthlyForecastOutputSchema>;

export async function getMonthlyForecast(input: MonthlyForecastInput): Promise<MonthlyForecastOutput> {
  return monthlyForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monthlyForecastPrompt',
  input: {schema: MonthlyForecastInputSchema},
  output: {schema: MonthlyForecastOutputSchema},
  prompt: `Given the birth details and current date, provide a personalized astrological forecast for the current and upcoming month.

Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth Location: {{{birthLocation}}}
Current Date: {{{currentDate}}}

Focus on major planetary transits and their potential effects on the user's life. Include traditional astrological interpretations where relevant, but also provide modern, psychological interpretations.

Format the forecast in an easy-to-understand manner.
`,
});

const monthlyForecastFlow = ai.defineFlow(
  {
    name: 'monthlyForecastFlow',
    inputSchema: MonthlyForecastInputSchema,
    outputSchema: MonthlyForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
