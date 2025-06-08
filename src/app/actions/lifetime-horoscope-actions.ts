
'use server';
import { getLifetimeHoroscope, type LifetimeHoroscopeInput, type YearlyForecast } from '@/ai/flows/lifetime-horoscope';
import { translateText } from '@/ai/flows/translate-text-flow';
import type { LifetimeHoroscopeReport, LifetimeHoroscopeReportTexts } from '@/lib/types';
import type { LifetimeHoroscopeFormValues } from '@/lib/schemas';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const NUMBER_OF_YEARS_TO_FORECAST = 80; // Generate for 80 years

export async function getLifetimeHoroscopeAction(
  values: LifetimeHoroscopeFormValues
): Promise<LifetimeHoroscopeReport | { error: string }> {
  try {
    const birthDateStr = formatDate(values.birthDate);
    const birthYear = values.birthDate.getFullYear();

    const lifetimeHoroscopeInput: LifetimeHoroscopeInput = {
      birthDate: birthDateStr,
      birthTime: values.birthTime,
      birthLocation: values.birthLocation,
      startYear: birthYear,
      numberOfYears: NUMBER_OF_YEARS_TO_FORECAST,
    };

    const result = await getLifetimeHoroscope(lifetimeHoroscopeInput);
    
    if (!result || !result.forecasts || result.forecasts.length === 0) {
        return { error: `Failed to generate lifetime horoscope. The cosmic records for this period seem elusive. Found ${result?.forecasts?.length || 0} forecasts.` };
    }

    return {
      forecasts: result.forecasts,
    };
  } catch (error) {
    console.error("Error fetching lifetime horoscope:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `An unexpected error occurred while charting your lifetime: ${errorMessage}. Please try again.` };
  }
}


export async function translateLifetimeHoroscopeAction(
  reportTexts: LifetimeHoroscopeReportTexts,
  targetLanguage: string
): Promise<LifetimeHoroscopeReportTexts | { error: string }> {
  if (targetLanguage.toLowerCase() === 'english' || !reportTexts.forecasts) {
    return reportTexts;
  }
  try {
    const translateForecast = async (forecast: { year: number; forecast: string | null | undefined }): Promise<{ year: number; forecast: string | null | undefined }> => {
      if (!forecast.forecast) return forecast;
      const result = await translateText({ textToTranslate: forecast.forecast, targetLanguage });
      return { year: forecast.year, forecast: result.translatedText };
    };

    const translatedForecasts = await Promise.all(
        reportTexts.forecasts.map(fc => translateForecast(fc))
    );

    return {
      forecasts: translatedForecasts,
    };
  } catch (error) {
    console.error(`Error translating lifetime horoscope to ${targetLanguage}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { error: `Failed to translate lifetime report to ${targetLanguage}: ${errorMessage}` };
  }
}
