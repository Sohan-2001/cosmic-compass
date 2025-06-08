
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

export interface ProminentFeature {
  feature: string;
  interpretation: string;
}

export interface FaceReadingReport {
  overallImpression?: string | null;
  prominentFeatures?: ProminentFeature[] | null;
  personalityInsights?: string[] | null;
  potentialLifeAspects?: string | null;
  error?: string | null;
}

// For translation action
export interface FaceReadingReportTexts {
  overallImpression?: string | null;
  prominentFeatures?: { feature: string; interpretation: string | null | undefined }[] | null;
  personalityInsights?: (string | null | undefined)[] | null;
  potentialLifeAspects?: string | null;
}
