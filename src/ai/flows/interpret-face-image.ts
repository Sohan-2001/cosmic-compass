// src/ai/flows/interpret-face-image.ts
'use server';

/**
 * @fileOverview AI-powered face reading analysis.
 *
 * - interpretFaceImage - A function that handles the face image interpretation process.
 * - InterpretFaceImageInput - The input type for the interpretFaceImage function.
 * - InterpretFaceImageOutput - The return type for the interpretFaceImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretFaceImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a face, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z.string().describe('Any additional information about the face or person.'),
});
export type InterpretFaceImageInput = z.infer<typeof InterpretFaceImageInputSchema>;

const InterpretFaceImageOutputSchema = z.object({
  summary: z.string().describe('A summary of the face reading analysis.'),
  personalityInsights: z
    .string()
    .describe('Insights into the personality traits based on facial features.'),
  fortunePrediction: z.string().describe('Predictions about the person\'s fortune.'),
});
export type InterpretFaceImageOutput = z.infer<typeof InterpretFaceImageOutputSchema>;

export async function interpretFaceImage(
  input: InterpretFaceImageInput
): Promise<InterpretFaceImageOutput> {
  return interpretFaceImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretFaceImagePrompt',
  input: {schema: InterpretFaceImageInputSchema},
  output: {schema: InterpretFaceImageOutputSchema},
  prompt: `You are an expert in face reading. Analyze the provided image to provide insights into a person's personality and fortune.

Description: {{{description}}}
Photo: {{media url=photoDataUri}}

Provide a summary, personality insights, and a fortune prediction.
`,
});

const interpretFaceImageFlow = ai.defineFlow(
  {
    name: 'interpretFaceImageFlow',
    inputSchema: InterpretFaceImageInputSchema,
    outputSchema: InterpretFaceImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
