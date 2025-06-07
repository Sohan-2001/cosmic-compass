
'use server';
import { getMonthlyForecast, type MonthlyForecastInput } from '@/ai/flows/monthly-forecast';
import { getYearlyOutlook, type YearlyOutlookInput } from '@/ai/flows/yearly-outlook';
import { predictEvents, type PredictEventsInput } from '@/ai/flows/event-prediction';
import type { CombinedAstrologyReport } from '@/lib/types';
import type { AstrologyFormValues } from '@/lib/schemas'; // Updated import

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export async function getCombinedAstrologyReportAction(
  values: AstrologyFormValues
): Promise<CombinedAstrologyReport | { error: string }> {
  try {
    const birthDateStr = formatDate(values.birthDate);
    const currentDateStr = formatDate(new Date());

    const monthlyForecastInput: MonthlyForecastInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
      currentDate: currentDateStr,
    };

    const yearlyOutlookInput: YearlyOutlookInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
    };

    // For predictEvents, let's ask for events in the next 3 years, but not detailed monthly/yearly which we get separately.
    const eventPredictionInput: PredictEventsInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
      numberOfYears: 3, 
      upcomingMonth: false, // We get this from getMonthlyForecast
      upcomingYear: false,  // We get this from getYearlyOutlook
    };

    const [monthlyResult, yearlyResult, eventsResult] = await Promise.all([
      getMonthlyForecast(monthlyForecastInput),
      getYearlyOutlook(yearlyOutlookInput),
      predictEvents(eventPredictionInput),
    ]);
    
    // Check if any AI flow returned an error-like structure or empty output
    // This is a basic check; actual error handling might depend on AI flow specifics
    if (!monthlyResult?.monthlyForecast && !yearlyResult?.yearlyOverview && !eventsResult?.eventPredictions) {
        return { error: "Failed to generate astrology report. The stars are একটু মেঘলা today." };
    }

    return {
      monthlyForecast: monthlyResult?.monthlyForecast || "Could not generate monthly forecast.",
      yearlyOutlook: yearlyResult?.yearlyOverview || "Could not generate yearly outlook.",
      significantEvents: eventsResult?.eventPredictions || "Could not predict significant events.",
    };
  } catch (error) {
    console.error("Error fetching astrology reports:", error);
    return { error: "An unexpected error occurred while consulting the cosmos. Please try again." };
  }
}
