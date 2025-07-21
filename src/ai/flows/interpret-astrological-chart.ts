
'use server';

/**
 * @fileOverview An astrological chart interpretation AI agent.
 *
 * - interpretAstrologicalChart - A function that handles the astrological chart interpretation process.
 * - InterpretAstrologicalChartInput - The input type for the interpretAstrologicalChart function.
 * - InterpretAstrologicalChartOutput - The return type for the interpretAstrologicalChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretAstrologicalChartInputSchema = z.object({
  birthDate: z.string().describe('The date of birth (e.g., YYYY-MM-DD).'),
  birthTime: z.string().describe('The time of birth (e.g., HH:MM in 24-hour format).'),
  birthLocation: z.string().describe('The location of birth (city, country).'),
  astrologySystem: z.string().describe('The astrological system to use (e.g., "Western (Tropical)", "Vedic (Sidereal)").'),
});

export type InterpretAstrologicalChartInput = z.infer<typeof InterpretAstrologicalChartInputSchema>;

const InterpretAstrologicalChartOutputSchema = z.object({
  personalityTraits: z.string().describe('An interpretation of the user\'s personality traits based on their astrological chart.'),
  lifeTendencies: z.string().describe('An overview of the user\'s life tendencies and potential challenges.'),
  keyInsights: z.string().describe('Key insights into the user\'s strengths and areas for growth.'),
  nextMonthForecast: z.string().describe('A brief astrological forecast for the next month.'),
  nextThreeYearsForecast: z.string().describe('A brief astrological forecast for the next three years.'),
  significantEvents: z.string().describe('A forecast of any significant life events that might happen, including the probable time of occurrence.'),
});

export type InterpretAstrologicalChartOutput = z.infer<typeof InterpretAstrologicalChartOutputSchema>;

export async function interpretAstrologicalChart(input: InterpretAstrologicalChartInput): Promise<InterpretAstrologicalChartOutput> {
  return interpretAstrologicalChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretAstrologicalChartPrompt',
  input: {schema: InterpretAstrologicalChartInputSchema},
  output: {schema: InterpretAstrologicalChartOutputSchema},
  prompt: `You are an expert astrologer. Provide a comprehensive interpretation of an astrological chart based on the provided birth details and astrological system.

Astrological System: {{{astrologySystem}}}
Birth Date: {{{birthDate}}}
Birth Time: {{{birthTime}}}
Birth Location: {{{birthLocation}}}

Provide forecasts for the next month, the next three years, and predict any significant life events.
  `,
});

const interpretAstrologicalChartFlow = ai.defineFlow(
  {
    name: 'interpretAstrologicalChartFlow',
    inputSchema: InterpretAstrologicalChartInputSchema,
    outputSchema: InterpretAstrologicalChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
