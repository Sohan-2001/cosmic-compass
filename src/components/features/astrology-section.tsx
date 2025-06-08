
'use client';
import { useState, useRef, useEffect } from 'react';
import { AstrologyForm, type AstrologyFormValues } from '@/components/forms/astrology-form';
import { getCombinedAstrologyReportAction, translateAstrologyReportAction, type AstrologyReportTexts } from '@/app/actions/astrology-actions';
import type { CombinedAstrologyReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { CalendarHeart, Crown, Zap, AlertTriangle, Sparkles, TrendingUp, CalendarDays, Languages } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '../ui/button';


const availableLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Bengali", label: "বাংলা (Bangla)" },
];

export function AstrologySection() {
  const [originalReport, setOriginalReport] = useState<CombinedAstrologyReport | null>(null);
  const [displayedReport, setDisplayedReport] = useState<CombinedAstrologyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const { toast } = useToast();
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [currentDisplayYear, setCurrentDisplayYear] = useState(new Date().getFullYear());

  const handleSubmit = async (values: AstrologyFormValues) => {
    setIsLoading(true);
    setError(null);
    setOriginalReport(null);
    setDisplayedReport(null);
    setSelectedLanguage("English");
    setCurrentDisplayYear(new Date(values.birthDate).getFullYear());

    const response = await getCombinedAstrologyReportAction(values);

    if ('error' in response) {
      setError(response.error);
      toast({
        title: 'Error Generating Report',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setOriginalReport(response);
      setDisplayedReport(response);
      setCurrentDisplayYear(new Date().getFullYear());
    }
    setIsLoading(false);
  };

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    if (!originalReport) return;

    if (lang.toLowerCase() === "english") {
      setDisplayedReport(originalReport);
      return;
    }

    setIsTranslating(true);
    setError(null);
    const reportTexts: AstrologyReportTexts = {
        thisMonthForecast: originalReport.thisMonthForecast,
        nextMonthForecast: originalReport.nextMonthForecast,
        thisYearOutlook: originalReport.thisYearOutlook,
        nextYearOutlook: originalReport.nextYearOutlook,
        yearAfterNextOutlook: originalReport.yearAfterNextOutlook,
        generalSignificantEvents: originalReport.generalSignificantEvents,
    };

    const translatedResponse = await translateAstrologyReportAction(reportTexts, lang);
    if ('error' in translatedResponse) {
        setError(translatedResponse.error);
        toast({
            title: 'Translation Error',
            description: translatedResponse.error,
            variant: 'destructive',
        });
        setDisplayedReport(originalReport); // Fallback to original
    } else {
        setDisplayedReport(translatedResponse as CombinedAstrologyReport);
    }
    setIsTranslating(false);
  };

  useEffect(() => {
    if (displayedReport && !isLoading && !isTranslating && resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [displayedReport, isLoading, isTranslating]);

  return (
    <div className="space-y-8">
      <AstrologyForm onSubmit={handleSubmit} isLoading={isLoading} />

      {(isLoading || isTranslating) && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            {isLoading ? "The cosmos is aligning your destiny..." : "Translating your destiny..."}
          </p>
        </div>
      )}

      {error && !isLoading && !isTranslating && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {displayedReport && !isLoading && !isTranslating && (
        <div ref={resultsContainerRef} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Your Astrological Insights
            </h2>
            <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-muted-foreground" />
                <Select value={selectedLanguage} onValueChange={handleLanguageChange} disabled={isTranslating}>
                    <SelectTrigger className="w-auto min-w-[150px] bg-card text-card-foreground border-border">
                        <SelectValue placeholder="Translate..." />
                    </SelectTrigger>
                    <SelectContent>
                        {availableLanguages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          {displayedReport.thisMonthForecast && (
            <ReportCard title="This Month's Forecast" icon={<CalendarDays className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.thisMonthForecast}</p>
            </ReportCard>
          )}
          {displayedReport.nextMonthForecast && (
            <ReportCard title="Next Month's Forecast" icon={<CalendarHeart className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.nextMonthForecast}</p>
            </ReportCard>
          )}
          {displayedReport.thisYearOutlook && (
            <ReportCard title={`This Year's Outlook (${currentDisplayYear})`} icon={<Crown className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.thisYearOutlook}</p>
            </ReportCard>
          )}
          {displayedReport.nextYearOutlook && (
            <ReportCard title={`Next Year's Outlook (${currentDisplayYear + 1})`} icon={<TrendingUp className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.nextYearOutlook}</p>
            </ReportCard>
          )}
          {displayedReport.yearAfterNextOutlook && (
            <ReportCard title={`Outlook for ${currentDisplayYear + 2}`} icon={<Zap className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.yearAfterNextOutlook}</p>
            </ReportCard>
          )}
          {displayedReport.generalSignificantEvents && (
            <ReportCard title="Other Significant Events" icon={<Sparkles className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{displayedReport.generalSignificantEvents}</p>
            </ReportCard>
          )}
        </div>
      )}
    </div>
  );
}
