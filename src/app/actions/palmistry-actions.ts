
'use server';
import { palmReading, type PalmReadingInput, type PalmReadingOutput } from '@/ai/flows/palm-reading';
import { translateText } from '@/ai/flows/translate-text-flow';
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

export interface PalmReadingReportTexts {
  summary?: string | null;
  keyPredictions?: string[] | null;
  detailedAnalysis?: string | null;
}

export async function translatePalmReadingReportAction(
  reportTexts: PalmReadingReportTexts,
  targetLanguage: string
): Promise<PalmReadingReportTexts | { error: string }> {
  if (targetLanguage.toLowerCase() === 'english') {
    return reportTexts;
  }
  try {
    const translateField = async (text: string | null | undefined): Promise<string | null | undefined> => {
      if (!text) return text;
      const result = await translateText({ textToTranslate: text, targetLanguage });
      return result.translatedText;
    };

    const translatedSummary = await translateField(reportTexts.summary);
    const translatedDetailedAnalysis = await translateField(reportTexts.detailedAnalysis);
    
    let translatedKeyPredictions: string[] | null = null;
    if (reportTexts.keyPredictions && reportTexts.keyPredictions.length > 0) {
      translatedKeyPredictions = await Promise.all(
        reportTexts.keyPredictions.map(pred => translateField(pred).then(res => res || ""))
      );
    }

    return {
      summary: translatedSummary,
      keyPredictions: translatedKeyPredictions,
      detailedAnalysis: translatedDetailedAnalysis,
    };
  } catch (error) {
    console.error(`Error translating palm reading report to ${targetLanguage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to translate report to ${targetLanguage}: ${errorMessage}` };
  }
}
