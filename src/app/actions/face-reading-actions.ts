
'use server';
import { faceReading, type FaceReadingInput, type FaceReadingOutput } from '@/ai/flows/face-reading';
import { translateText } from '@/ai/flows/translate-text-flow';
import type { FaceReadingReport, FaceReadingReportTexts, ProminentFeature } from '@/lib/types';
// FaceUploadFormValues is for the client-side form, not directly for this action's input.

export async function getFaceReadingAction(
  data: { faceImageUrl: string } // Expecting the blob URL
): Promise<FaceReadingReport | { error: string }> {
  try {
    const faceReadingInput: FaceReadingInput = {
      faceImageUrl: data.faceImageUrl,
    };

    const result: FaceReadingOutput = await faceReading(faceReadingInput);

    if (result.error) {
      return { error: result.error };
    }
    
    if (!result.overallImpression && (!result.prominentFeatures || result.prominentFeatures.length === 0) && (!result.personalityInsights || result.personalityInsights.length === 0) && !result.potentialLifeAspects) {
        return { error: "Failed to generate a complete face reading. Your features are mysterious or the AI response was incomplete." };
    }

    return {
      overallImpression: result.overallImpression || null,
      prominentFeatures: result.prominentFeatures || null,
      personalityInsights: result.personalityInsights || null,
      potentialLifeAspects: result.potentialLifeAspects || null,
    };

  } catch (error) {
    console.error("Error fetching face reading:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `An unexpected error occurred while analyzing your features: ${errorMessage}. Please try again.` };
  }
}

export async function translateFaceReadingReportAction(
  reportTexts: FaceReadingReportTexts,
  targetLanguage: string
): Promise<FaceReadingReportTexts | { error: string }> {
  if (targetLanguage.toLowerCase() === 'english') {
    return reportTexts;
  }
  try {
    const translateField = async (text: string | null | undefined): Promise<string | null | undefined> => {
      if (!text) return text;
      const result = await translateText({ textToTranslate: text, targetLanguage });
      return result.translatedText;
    };

    const translateProminentFeature = async (feature: { feature: string; interpretation: string | null | undefined }): Promise<{ feature: string; interpretation: string | null | undefined }> => {
        const translatedInterpretation = await translateField(feature.interpretation);
        return { feature: feature.feature, interpretation: translatedInterpretation };
    };

    const translatedOverallImpression = await translateField(reportTexts.overallImpression);
    const translatedPotentialLifeAspects = await translateField(reportTexts.potentialLifeAspects);
    
    let translatedProminentFeatures: { feature: string; interpretation: string | null | undefined }[] | null = null;
    if (reportTexts.prominentFeatures && reportTexts.prominentFeatures.length > 0) {
      translatedProminentFeatures = await Promise.all(
        reportTexts.prominentFeatures.map(feat => translateProminentFeature(feat))
      );
    }

    let translatedPersonalityInsights: (string | null | undefined)[] | null = null;
    if (reportTexts.personalityInsights && reportTexts.personalityInsights.length > 0) {
        translatedPersonalityInsights = await Promise.all(
            reportTexts.personalityInsights.map(insight => translateField(insight))
        );
    }

    return {
      overallImpression: translatedOverallImpression,
      prominentFeatures: translatedProminentFeatures,
      personalityInsights: translatedPersonalityInsights,
      potentialLifeAspects: translatedPotentialLifeAspects,
    };
  } catch (error) {
    console.error(`Error translating face reading report to ${targetLanguage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to translate report to ${targetLanguage}: ${errorMessage}` };
  }
}
