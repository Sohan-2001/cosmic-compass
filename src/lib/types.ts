
export interface CombinedAstrologyReport {
  thisMonthForecast?: string | null;
  nextMonthForecast?: string | null;
  thisYearOutlook?: string | null;
  nextYearOutlook?: string | null;
  yearAfterNextOutlook?: string | null;
  generalSignificantEvents?: string | null;
}

export interface PalmReadingReport {
  summary?: string | null;
  keyPredictions?: string[] | null;
  detailedAnalysis?: string | null;
  error?: string | null;
}

export interface YearlyForecast {
  year: number;
  forecast: string;
}

export interface LifetimeHoroscopeReport {
  forecasts: YearlyForecast[];
}

// For translation action
export interface LifetimeHoroscopeReportTexts {
  forecasts?: { year: number; forecast: string | null | undefined }[] | null;
}
