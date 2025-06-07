
'use server';

/**
 * @fileOverview Generates a personalized palm reading based on an uploaded palm image.
 *
 * - palmReading - A function that handles the palm reading process.
 * - PalmReadingInput - The input type for the palmReading function.
 * - PalmReadingOutput - The return type for the palmReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PalmReadingInputSchema = z.object({
  palmImageDataUri: z
    .string()
    .describe(
      "A photo of a palm, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type PalmReadingInput = z.infer<typeof PalmReadingInputSchema>;

const PalmReadingOutputSchema = z.object({
  reading: z.string().describe('A personalized palm reading. Can contain an error message if generation failed.'),
});
export type PalmReadingOutput = z.infer<typeof PalmReadingOutputSchema>;


export async function palmReading(input: PalmReadingInput): Promise<PalmReadingOutput> {
  return palmReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'palmReadingPrompt',
  input: {schema: PalmReadingInputSchema},
  output: {schema: PalmReadingOutputSchema}, // This output schema will be used by the model for structured output
  prompt: `You are an expert palm reader. Analyze the provided palm image and generate a personalized reading based on traditional palmistry principles.

Palm Image: {{media url=palmImageDataUri}}

Generate a detailed and insightful palm reading, covering major lines and features. If you cannot analyze the image or perform the reading for any reason, please explain why.`,
});

const palmReadingFlow = ai.defineFlow(
  {
    name: 'palmReadingFlow',
    inputSchema: PalmReadingInputSchema,
    outputSchema: PalmReadingOutputSchema,
  },
  async (input: PalmReadingInput): Promise<PalmReadingOutput> => {
    try {
      const result = await prompt(input);

      if (!result || !result.output || typeof result.output.reading !== 'string' || result.output.reading.trim() === '') {
        console.error('Palm reading flow received invalid or empty output from prompt. Result output:', result?.output);
        return { reading: "The AI couldn't generate a palm reading from this image. The response was empty or not in the expected format. Please try a different image or try again later." };
      }
      return result.output;
    } catch (e: any) {
      console.error('Error during palmReadingFlow execution:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      // Ensure the error message is not excessively long for display
      const displayErrorMessage = errorMessage.length > 150 ? errorMessage.substring(0, 150) + '...' : errorMessage;
      return { reading: `An error occurred while processing the palm reading: ${displayErrorMessage}. Please check the image or try again.` };
    }
  }
);
