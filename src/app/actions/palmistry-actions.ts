
'use server';
import { palmReading, type PalmReadingInput } from '@/ai/flows/palm-reading';
import type { PalmReadingReport } from '@/lib/types';
import type { PalmUploadFormValues } from '@/lib/schemas'; // Updated import

export async function getPalmReadingAction(
  values: PalmUploadFormValues
): Promise<PalmReadingReport | { error: string }> {
  try {
    const palmReadingInput: PalmReadingInput = {
      palmImageDataUri: values.palmImage,
    };

    const result = await palmReading(palmReadingInput);

    if (!result?.reading) {
      return { error: "Failed to generate palm reading. Your destiny is currently unreadable." };
    }

    return {
      reading: result.reading,
    };
  } catch (error) {
    console.error("Error fetching palm reading:", error);
    return { error: "An unexpected error occurred while reading your palm. Please try again." };
  }
}
