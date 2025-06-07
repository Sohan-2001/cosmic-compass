
'use server';

/**
 * @fileOverview Provides a personalized astrological forecast for the current and next month based on birth details.
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
  currentDate: z.string().describe('The current date (YYYY-MM-DD), for context.'),
});
export type MonthlyForecastInput = z.infer<typeof MonthlyForecastInputSchema>;

const MonthlyForecastOutputSchema = z.object({
  thisMonthForecast: z.string().describe('A personalized astrological forecast for the current month. The current date is {{{currentDate}}}.'),
  nextMonthForecast: z.string().describe('A personalized astrological forecast for the month following the current month. The current date is {{{currentDate}}}.'),
});
export type MonthlyForecastOutput = z.infer<typeof MonthlyForecastOutputSchema>;

export async function getMonthlyForecast(input: MonthlyForecastInput): Promise<MonthlyForecastOutput> {
  return monthlyForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'monthlyForecastPrompt',
  input: {schema: MonthlyForecastInputSchema},
  output: {schema: MonthlyForecastOutputSchema},
  prompt: `You are an expert astrologer. Given the birth details (Birth Date: {{{birthDate}}}, Birth Time: {{{birthTime}}}, Birth Location: {{{birthLocation}}}) and current date {{{currentDate}}}, provide a personalized astrological forecast for:
1.  The current month.
2.  The next month.

Focus on major planetary transits and their potential effects on the user's life. Include traditional astrological interpretations where relevant, but also provide modern, psychological interpretations.
Format the forecast in an easy-to-understand manner.
Provide distinct forecasts for "thisMonthForecast" and "nextMonthForecast".
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
