
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
  birthDate: z.string().describe('The date of birth (e.g., YYYY-MM-DD). The correct Zodiac sign is also provided in parenthesis for accuracy.'),
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
  prompt: `You are an expert astrologer. Your task is to provide a comprehensive interpretation of the user's astrological chart based on the provided birth details and the selected astrological system.

  Astrological System to use: {{{astrologySystem}}}
  
  You must perform your analysis using the system specified above. Take the birth location into account for accurate calculations. The user has also confirmed their Zodiac sign, which is provided with the birth date - use that as the primary sun sign for the reading.

  In addition, provide the following forecasts based on the principles of the selected system:
  - A brief forecast for the next month.
  - A brief forecast for the next three years.
  - A prediction of any significant life events that may occur, including the probable timing.

  Birth Date: {{{birthDate}}}
  Birth Time: {{{birthTime}}}
  Birth Location: {{{birthLocation}}}
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
