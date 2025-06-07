
'use server';
import { getMonthlyForecast, type MonthlyForecastInput } from '@/ai/flows/monthly-forecast';
import { getYearlyPredictions, type YearlyPredictionsInput } from '@/ai/flows/event-prediction';
import { translateText } from '@/ai/flows/translate-text-flow';
import type { CombinedAstrologyReport } from '@/lib/types';
import type { AstrologyFormValues } from '@/lib/schemas';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getCombinedAstrologyReportAction(
  values: AstrologyFormValues
): Promise<CombinedAstrologyReport | { error: string }> {
  try {
    const birthDateStr = formatDate(values.birthDate);
    const currentDate = new Date();
    const currentDateStr = formatDate(currentDate);
    const currentFullDateStr = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const currentYear = currentDate.getFullYear();

    const monthlyForecastInput: MonthlyForecastInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
      currentDate: currentDateStr,
    };

    const yearlyPredictionsInput: YearlyPredictionsInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
      currentFullDate: currentFullDateStr,
      currentYear: currentYear,
      nextYear: currentYear + 1,
      yearAfterNext: currentYear + 2,
    };

    const [monthlyResult, yearlyResult] = await Promise.all([
      getMonthlyForecast(monthlyForecastInput),
      getYearlyPredictions(yearlyPredictionsInput),
    ]);
    
    if (!monthlyResult && !yearlyResult) {
        return { error: "Failed to generate astrology report. The stars are a bit cloudy today." };
    }

    return {
      thisMonthForecast: monthlyResult?.thisMonthForecast || "Could not generate this month's forecast.",
      nextMonthForecast: monthlyResult?.nextMonthForecast || "Could not generate next month's forecast.",
      thisYearOutlook: yearlyResult?.thisYearOutlook || `Could not generate outlook for ${currentYear}.`,
      nextYearOutlook: yearlyResult?.nextYearOutlook || `Could not generate outlook for ${currentYear + 1}.`,
      yearAfterNextOutlook: yearlyResult?.yearAfterNextOutlook || `Could not generate outlook for ${currentYear + 2}.`,
      generalSignificantEvents: yearlyResult?.generalSignificantEvents || undefined,
    };
  } catch (error) {
    console.error("Error fetching astrology reports:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `An unexpected error occurred while consulting the cosmos: ${errorMessage}. Please try again.` };
  }
}

export interface AstrologyReportTexts {
  thisMonthForecast?: string | null;
  nextMonthForecast?: string | null;
  thisYearOutlook?: string | null;
  nextYearOutlook?: string | null;
  yearAfterNextOutlook?: string | null;
  generalSignificantEvents?: string | null;
}

export async function translateAstrologyReportAction(
  reportTexts: AstrologyReportTexts,
  targetLanguage: string
): Promise<AstrologyReportTexts | { error: string }> {
  if (targetLanguage.toLowerCase() === 'english') {
    return reportTexts;
  }
  try {
    const translateField = async (text: string | null | undefined): Promise<string | null | undefined> => {
      if (!text) return text;
      const result = await translateText({ textToTranslate: text, targetLanguage });
      return result.translatedText;
    };

    const [
      translatedThisMonth,
      translatedNextMonth,
      translatedThisYear,
      translatedNextYear,
      translatedYearAfterNext,
      translatedGeneralEvents,
    ] = await Promise.all([
      translateField(reportTexts.thisMonthForecast),
      translateField(reportTexts.nextMonthForecast),
      translateField(reportTexts.thisYearOutlook),
      translateField(reportTexts.nextYearOutlook),
      translateField(reportTexts.yearAfterNextOutlook),
      translateField(reportTexts.generalSignificantEvents),
    ]);

    return {
      thisMonthForecast: translatedThisMonth,
      nextMonthForecast: translatedNextMonth,
      thisYearOutlook: translatedThisYear,
      nextYearOutlook: translatedNextYear,
      yearAfterNextOutlook: translatedYearAfterNext,
      generalSignificantEvents: translatedGeneralEvents,
    };
  } catch (error) {
    console.error(`Error translating astrology report to ${targetLanguage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to translate report to ${targetLanguage}: ${errorMessage}` };
  }
}
