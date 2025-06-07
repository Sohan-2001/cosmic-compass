
'use server';
import { getMonthlyForecast, type MonthlyForecastInput } from '@/ai/flows/monthly-forecast';
import { getYearlyPredictions, type YearlyPredictionsInput } from '@/ai/flows/event-prediction'; // Updated import
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
      generalSignificantEvents: yearlyResult?.generalSignificantEvents || undefined, // Keep as undefined if not provided
    };
  } catch (error) {
    console.error("Error fetching astrology reports:", error);
    // It's good to check the actual error type if possible, but toString() is a safe bet.
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `An unexpected error occurred while consulting the cosmos: ${errorMessage}. Please try again.` };
  }
}
