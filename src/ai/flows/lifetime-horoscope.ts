
'use server';
/**
 * @fileOverview Provides a year-by-year lifetime astrological forecast.
 *
 * - getLifetimeHoroscope - A function that returns the lifetime horoscope.
 * - LifetimeHoroscopeInput - The input type for the getLifetimeHoroscope function.
 * - LifetimeHoroscopeOutput - The return type for the getLifetimeHoroscope function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const YearlyForecastSchema = z.object({
  year: z.number().describe('The calendar year for the forecast.'),
  forecast: z.string().describe('A concise 1-2 line astrological forecast for that year.'),
});
export type YearlyForecast = z.infer<typeof YearlyForecastSchema>;

const LifetimeHoroscopeInputSchema = z.object({
  birthDate: z.string().describe('The date of birth (YYYY-MM-DD).'),
  birthTime: z.string().describe('The time of birth (HH:mm).'),
  birthLocation: z.string().describe('The location of birth (e.g., City, Country).'),
  startYear: z.number().describe('The year to start the forecast from (usually birth year).'),
  numberOfYears: z.number().min(1).max(100).describe('The number of years to forecast (e.g., 80 for 80 years).'),
});
export type LifetimeHoroscopeInput = z.infer<typeof LifetimeHoroscopeInputSchema>;

const LifetimeHoroscopeOutputSchema = z.object({
  forecasts: z.array(YearlyForecastSchema).describe('An array of yearly forecasts.'),
});
export type LifetimeHoroscopeOutput = z.infer<typeof LifetimeHoroscopeOutputSchema>;

export async function getLifetimeHoroscope(input: LifetimeHoroscopeInput): Promise<LifetimeHoroscopeOutput> {
  return lifetimeHoroscopeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lifetimeHoroscopePrompt',
  input: {schema: LifetimeHoroscopeInputSchema},
  output: {schema: LifetimeHoroscopeOutputSchema},
  prompt: `You are an expert astrologer with profound insight into long-term life patterns.
Given the birth details:
Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth Location: {{{birthLocation}}}

Starting from the year {{{startYear}}}, generate a concise (1-2 lines MAXIMUM per year) astrological forecast for each of the next {{{numberOfYears}}} years.
For each year, provide the calendar year and its brief forecast.
Focus on major overarching themes, significant planetary influences, or potential life phase shifts for each specific year. Avoid definitive predictions of events; instead, focus on the energetic potentials.
The output must be an array of objects, where each object contains 'year' and 'forecast'.
Example for one year: { "year": 2025, "forecast": "A year of potential career growth and new beginnings in relationships." }
Generate forecasts for all {{{numberOfYears}}} years.
`,
});

const lifetimeHoroscopeFlow = ai.defineFlow(
  {
    name: 'lifetimeHoroscopeFlow',
    inputSchema: LifetimeHoroscopeInputSchema,
    outputSchema: LifetimeHoroscopeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure the AI provides a response, and specifically the forecasts array.
    if (!output || !output.forecasts) {
      console.error("Lifetime horoscope flow received null or incomplete output from prompt.", output);
      // Return an empty forecast array or handle as an error upstream.
      // For now, let's ensure it fits the schema even if empty.
      return { forecasts: [] };
    }
    return output;
  }
);
