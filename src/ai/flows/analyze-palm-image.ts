'use server';

/**
 * @fileOverview AI-powered palmistry analysis flow.
 *
 * - analyzePalmImage - A function that handles the palm image analysis process.
 * - AnalyzePalmImageInput - The input type for the analyzePalmImage function.
 * - AnalyzePalmImageOutput - The return type for the analyzePalmImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePalmImageInputSchema = z.object({
  palmImageDataUri: z
    .string()
    .describe(
      "A photo of a palm, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePalmImageInput = z.infer<typeof AnalyzePalmImageInputSchema>;

const AnalyzePalmImageOutputSchema = z.object({
  analysis: z.string().describe('The AI-powered palmistry analysis.'),
});
export type AnalyzePalmImageOutput = z.infer<typeof AnalyzePalmImageOutputSchema>;

export async function analyzePalmImage(input: AnalyzePalmImageInput): Promise<AnalyzePalmImageOutput> {
  return analyzePalmImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePalmImagePrompt',
  input: {schema: AnalyzePalmImageInputSchema},
  output: {schema: AnalyzePalmImageOutputSchema},
  prompt: `You are an expert palm reader. Analyze the provided palm image and provide a detailed palmistry analysis, including insights about the person's character, future, and potential.

Palm Image: {{media url=palmImageDataUri}}`,
});

const analyzePalmImageFlow = ai.defineFlow(
  {
    name: 'analyzePalmImageFlow',
    inputSchema: AnalyzePalmImageInputSchema,
    outputSchema: AnalyzePalmImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
