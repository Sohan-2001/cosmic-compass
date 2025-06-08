
'use server';

/**
 * @fileOverview Generates a personalized face reading based on an uploaded face image.
 *
 * - faceReading - A function that handles the face reading process.
 * - FaceReadingInput - The input type for the faceReading function.
 * - FaceReadingOutput - The return type for the faceReading function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FaceReadingInputSchema = z.object({
  faceImageUrl: z
    .string()
    .url()
    .describe(
      "A publicly accessible URL to a photo of a face."
    ),
});
export type FaceReadingInput = z.infer<typeof FaceReadingInputSchema>;

const ProminentFeatureSchema = z.object({
  feature: z.string().describe("Name of the prominent facial feature analyzed (e.g., Eyes, Forehead, Nose shape)."),
  interpretation: z.string().describe("Brief interpretation of what this feature suggests about personality or traits."),
});

const FaceReadingOutputSchema = z.object({
  overallImpression: z.string().optional().describe('A brief overall impression or summary based on the facial analysis (1-3 sentences).'),
  prominentFeatures: z.array(ProminentFeatureSchema)
    .optional()
    .describe('An array of 2 to 5 analyses of prominent facial features and their traditional physiognomic interpretations.'),
  personalityInsights: z.array(z.string()).optional().describe('A list of 3 to 6 key personality insights or traits suggested by the face reading.'),
  potentialLifeAspects: z.string().optional().describe('General insights into potential life aspects, strengths, or challenges as suggested by physiognomy (2-4 sentences).'),
  error: z.string().optional().describe('An error message if the reading could not be generated or if the image was unsuitable.'),
});
export type FaceReadingOutput = z.infer<typeof FaceReadingOutputSchema>;


export async function faceReading(input: FaceReadingInput): Promise<FaceReadingOutput> {
  return faceReadingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'faceReadingPrompt',
  input: {schema: FaceReadingInputSchema},
  output: {schema: FaceReadingOutputSchema},
  prompt: `You are an expert physiognomist with deep knowledge of traditional face reading.
Analyze the provided face image: {{media url=faceImageUrl}}

Carefully examine the overall face shape, forehead, eyes, eyebrows, nose, mouth, lips, chin, and any other significant features.
Based on your analysis, provide a personalized reading structured as follows:

1.  **overallImpression**: A brief overall impression or summary based on the facial analysis (1-3 sentences).
2.  **prominentFeatures**: Identify 2 to 5 prominent facial features. For each, describe the feature and provide its traditional physiognomic interpretation regarding personality or character traits.
3.  **personalityInsights**: List 3 to 6 key personality insights or traits directly suggested by the overall facial analysis.
4.  **potentialLifeAspects**: Offer general insights into potential life aspects, strengths, or challenges as suggested by the combination of facial features (2-4 sentences).

If you cannot analyze the image effectively (e.g., it's blurry, unclear, not a face, features are obscured, or the image URL is inaccessible), or if you cannot perform a meaningful reading for any other reason, please set the 'error' field in your response explaining the issue. In such cases, the other fields can be omitted or left empty.
Strive for insightful and authentic interpretations based on physiognomy principles. Ensure the tone is positive or neutral and constructive.`,
});

const faceReadingFlow = ai.defineFlow(
  {
    name: 'faceReadingFlow',
    inputSchema: FaceReadingInputSchema,
    outputSchema: FaceReadingOutputSchema,
  },
  async (input: FaceReadingInput): Promise<FaceReadingOutput> => {
    try {
      const {output} = await prompt(input);

      if (!output) {
         console.error('Face reading flow received null or undefined output from prompt.');
         return { error: "The AI couldn't generate a face reading. The response was empty. Please try a different image or try again later." };
      }
      
      if (output.error) {
        return { error: output.error };
      }

      if (!output.overallImpression && (!output.prominentFeatures || output.prominentFeatures.length === 0) && (!output.personalityInsights || output.personalityInsights.length === 0) && !output.potentialLifeAspects) {
        console.error('Face reading flow received an output that is effectively empty or incomplete from prompt. Output:', output);
        return { error: "The AI generated an incomplete or empty face reading. Please try a different image or try again later." };
      }
      
      return output;

    } catch (e: any) {
      console.error('Error during faceReadingFlow execution:', e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      const displayErrorMessage = errorMessage.length > 200 ? errorMessage.substring(0, 200) + '...' : errorMessage;
      return { error: `An error occurred while processing the face reading: ${displayErrorMessage}. Please check the image quality or try again.` };
    }
  }
);
