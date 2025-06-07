
export interface CombinedAstrologyReport {
  thisMonthForecast?: string | null;
  nextMonthForecast?: string | null;
  thisYearOutlook?: string | null;
  nextYearOutlook?: string | null;
  yearAfterNextOutlook?: string | null;
  generalSignificantEvents?: string | null;
}

export interface PalmReadingReport {
  reading?: string | null;
}
