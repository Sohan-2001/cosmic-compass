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
      "A photo of a palm, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'.
"
    ),
});
export type AnalyzePalmImageInput = z.infer<typeof AnalyzePalmImageInputSchema>;

const AnalyzePalmImageOutputSchema = z.object({
  summary: z.string().describe('A brief summary of the overall palm reading.'),
  lifeLine: z.string().describe('Analysis of the life line, indicating vitality, health, and major life changes.'),
  headLine: z.string().describe('Analysis of the head line, representing intellect, learning style, and communication.'),
  heartLine: z.string().describe('Analysis of the heart line, related to emotional stability, romantic perspectives, and relationships.'),
  fateLine: z.string().describe("Analysis of the fate line (if present), indicating the degree to which a person's life is affected by external circumstances."),
  probableEvents: z.string().describe('Analysis of potential major life events (e.g., marriage, career changes) indicated on the palm.'),
  futureOutlook: z.string().describe('An interpretation of potential good and bad incidents or trends for the future based on the palm lines.'),
  limitations: z.string().describe('A statement on any limitations of this reading. If certain lines are unclear or not visible, mention that specific information could not be extracted.'),
});
export type AnalyzePalmImageOutput = z.infer<typeof AnalyzePalmImageOutputSchema>;

export async function analyzePalmImage(input: AnalyzePalmImageInput): Promise<AnalyzePalmImageOutput> {
  return analyzePalmImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePalmImagePrompt',
  input: {schema: AnalyzePalmImageInputSchema},
  output: {schema: AnalyzePalmImageOutputSchema},
  prompt: `You are an expert palm reader. Analyze the provided palm image and provide a detailed palmistry analysis.

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
