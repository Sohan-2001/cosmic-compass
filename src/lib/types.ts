
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
