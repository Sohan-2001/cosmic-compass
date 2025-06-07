// This is an AI-powered function that generates a personalized palm reading based on an uploaded palm image.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * @fileOverview Generates a personalized palm reading based on an uploaded palm image.
 *
 * - palmReading - A function that handles the palm reading process.
 * - PalmReadingInput - The input type for the palmReading function.
 * - PalmReadingOutput - The return type for the palmReading function.
 */

const PalmReadingInputSchema = z.object({
  palmImageDataUri: z
    .string()
    .describe(
      'A photo of a palm, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the expected format description
    ),
});

export type PalmReadingInput = z.infer<typeof PalmReadingInputSchema>;

const PalmReadingOutputSchema = z.object({
  reading: z.string().describe('A personalized palm reading.'),
});

export type PalmReadingOutput = z.infer<typeof PalmReadingOutputSchema>;

export async function palmReading(input: PalmReadingInput): Promise<PalmReadingOutput> {
  return palmReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'palmReadingPrompt',
  input: {schema: PalmReadingInputSchema},
  output: {schema: PalmReadingOutputSchema},
  prompt: `You are an expert palm reader. Analyze the provided palm image and generate a personalized reading based on traditional palmistry principles.

Palm Image: {{media url=palmImageDataUri}}

Generate a detailed and insightful palm reading, covering major lines and features.`, // Added instructions for a detailed reading
});

const palmReadingFlow = ai.defineFlow(
  {
    name: 'palmReadingFlow',
    inputSchema: PalmReadingInputSchema,
    outputSchema: PalmReadingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
