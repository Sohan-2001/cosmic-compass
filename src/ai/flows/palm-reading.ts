
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
  summary: z.string().optional().describe('A brief overall summary of the palm reading (1-2 sentences).'),
  keyPredictions: z.array(z.string())
    .optional()
    .describe('An array of 3 to 7 concise key prediction points, suitable for a bulleted list. Each point should focus on a distinct important aspect.'),
  detailedAnalysis: z.string().optional().describe('The more in-depth traditional palm reading analysis, covering major lines (e.g., heart, head, life, fate) and notable features (e.g., mounts, markings). Explain their traditional meanings.'),
  error: z.string().optional().describe('An error message if the reading could not be generated or if the image was unsuitable.'),
});
export type PalmReadingOutput = z.infer<typeof PalmReadingOutputSchema>;


export async function palmReading(input: PalmReadingInput): Promise<PalmReadingOutput> {
  return palmReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'palmReadingPrompt',
  input: {schema: PalmReadingInputSchema},
  output: {schema: PalmReadingOutputSchema},
  prompt: `You are an expert palm reader with deep knowledge of traditional palmistry.
Analyze the provided palm image: {{media url=palmImageDataUri}}

Carefully examine the major lines (Heart, Head, Life, Fate/Destiny), mounts, and any significant markings.
Based on your analysis, provide a personalized reading structured as follows:

1.  **summary**: A brief overall summary of the palm reading (1-2 sentences).
2.  **keyPredictions**: Identify 3 to 7 of the most important and distinct predictions or insights from the palm. Present these as concise points suitable for a bulleted list. Focus on different life areas if possible (e.g., love, career, personality, health).
3.  **detailedAnalysis**: Provide a more in-depth traditional palm reading analysis. Discuss the meanings of the major lines you observe, the shapes of the hands and fingers (if discernible), the characteristics of the mounts, and any other notable markings. Explain their traditional interpretations clearly.

If you cannot analyze the image effectively (e.g., it's blurry, unclear, or not a palm), or if you cannot perform a meaningful reading for any other reason, please set the 'error' field in your response explaining the issue. In such cases, the other fields (summary, keyPredictions, detailedAnalysis) can be omitted or left empty.
Strive for insightful and authentic interpretations based on palmistry principles.`,
});

const palmReadingFlow = ai.defineFlow(
  {
    name: 'palmReadingFlow',
    inputSchema: PalmReadingInputSchema,
    outputSchema: PalmReadingOutputSchema,
  },
  async (input: PalmReadingInput): Promise<PalmReadingOutput> => {
    try {
      const {output} = await prompt(input);

      if (!output) {
         console.error('Palm reading flow received null or undefined output from prompt.');
         return { error: "The AI couldn't generate a palm reading. The response was empty. Please try a different image or try again later." };
      }
      
      // If AI indicates an error, prioritize that.
      if (output.error) {
        return { error: output.error };
      }

      // Check if essential parts of a successful reading are missing
      if (!output.summary && !output.detailedAnalysis && (!output.keyPredictions || output.keyPredictions.length === 0)) {
        console.error('Palm reading flow received an output that is effectively empty or incomplete from prompt. Output:', output);
        return { error: "The AI generated an incomplete or empty palm reading. Please try a different image or try again later." };
      }
      
      return output;

    } catch (e: any) {
      console.error('Error during palmReadingFlow execution:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      const displayErrorMessage = errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage;
      return { error: `An error occurred while processing the palm reading: ${displayErrorMessage}. Please check the image quality or try again.` };
    }
  }
);
