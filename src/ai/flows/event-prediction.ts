'use server';

/**
 * @fileOverview Predicts significant upcoming life events based on astrological charts and transits.
 *
 * - predictEvents - A function that handles the event prediction process.
 * - PredictEventsInput - The input type for the predictEvents function.
 * - PredictEventsOutput - The return type for the predictEvents function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictEventsInputSchema = z.object({
  birthDate: z
    .string()
    .describe('The date of birth in ISO 8601 format (YYYY-MM-DD).'),
  birthTime: z
    .string()
    .describe('The time of birth in HH:mm format (24-hour clock).'),
  birthLocation: z.string().describe('The location of birth (e.g., city, country).'),
  upcomingMonth: z.boolean().optional().describe('Predict for the upcoming month.'),
  upcomingYear: z.boolean().optional().describe('Predict for the upcoming year.'),
  numberOfYears: z.number().optional().describe('Predict for the next n number of years.')
});
export type PredictEventsInput = z.infer<typeof PredictEventsInputSchema>;

const PredictEventsOutputSchema = z.object({
  monthlyForecast: z.string().optional().describe('Astrological insights for the current and upcoming month.'),
  yearlyOutlook: z.string().optional().describe('Brief yearly astrological overviews.'),
  eventPredictions: z.string().describe('Predictions of significant upcoming life events.'),
});
export type PredictEventsOutput = z.infer<typeof PredictEventsOutputSchema>;

export async function predictEvents(input: PredictEventsInput): Promise<PredictEventsOutput> {
  return predictEventsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictEventsPrompt',
  input: {schema: PredictEventsInputSchema},
  output: {schema: PredictEventsOutputSchema},
  prompt: `You are an expert astrologer specializing in predicting significant life events based on astrological charts and transits.

  Given the following birth details, predict significant upcoming life events.

  Birth Date: {{{birthDate}}}
  Birth Time: {{{birthTime}}}
  Birth Location: {{{birthLocation}}}

  {% if upcomingMonth %}Predict astrological insights for the current and upcoming month, focusing on major transits and their potential effects.{% endif %}
  {% if upcomingYear %}Provide brief yearly astrological overviews, highlighting key planetary influences and potential life themes.{% endif %}
  {% if numberOfYears %}Predict significant upcoming life events for the next {{{numberOfYears}}} years.{% endif %}
  `,
});

const predictEventsFlow = ai.defineFlow(
  {
    name: 'predictEventsFlow',
    inputSchema: PredictEventsInputSchema,
    outputSchema: PredictEventsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
