
'use server';
import { palmReading, type PalmReadingInput, type PalmReadingOutput } from '@/ai/flows/palm-reading';
import type { PalmReadingReport } from '@/lib/types';
import type { PalmUploadFormValues } from '@/lib/schemas';

export async function getPalmReadingAction(
  values: PalmUploadFormValues
): Promise<PalmReadingReport | { error: string }> {
  try {
    const palmReadingInput: PalmReadingInput = {
      palmImageDataUri: values.palmImage,
    };

    const result: PalmReadingOutput = await palmReading(palmReadingInput);

    if (result.error) {
      return { error: result.error };
    }
    
    if (!result.summary && !result.detailedAnalysis && (!result.keyPredictions || result.keyPredictions.length === 0)) {
        return { error: "Failed to generate a complete palm reading. Your destiny is currently unreadable or the AI response was incomplete." };
    }

    return {
      summary: result.summary || null,
      keyPredictions: result.keyPredictions || null,
      detailedAnalysis: result.detailedAnalysis || null,
    };

  } catch (error) {
    console.error("Error fetching palm reading:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `An unexpected error occurred while reading your palm: ${errorMessage}. Please try again.` };
  }
}
