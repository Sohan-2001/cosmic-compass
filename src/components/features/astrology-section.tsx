
'use client';
import { useState, useRef, useEffect } from 'react';
import { AstrologyForm, type AstrologyFormValues } from '@/components/forms/astrology-form';
import { getCombinedAstrologyReportAction } from '@/app/actions/astrology-actions';
import type { CombinedAstrologyReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { CalendarHeart, Crown, Zap, AlertTriangle, Sparkles, TrendingUp, CalendarDays } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

export function AstrologySection() {
  const [results, setResults] = useState<CombinedAstrologyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const [currentDisplayYear, setCurrentDisplayYear] = useState(new Date().getFullYear());


  const handleSubmit = async (values: AstrologyFormValues) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setCurrentDisplayYear(new Date(values.birthDate).getFullYear()); // Or simply new Date().getFullYear() if you want current context years

    const response = await getCombinedAstrologyReportAction(values);

    if ('error' in response) {
      setError(response.error);
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setResults(response);
      // It's good practice to derive years for titles from a single source if possible
      // For simplicity, we'll use new Date().getFullYear() for titles
      setCurrentDisplayYear(new Date().getFullYear());
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (results && !isLoading && resultsContainerRef.current) {
      resultsContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [results, isLoading]);

  return (
    <div className="space-y-8">
      <AstrologyForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            The cosmos is aligning your destiny...
          </p>
        </div>
      )}

      {error && !isLoading && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {results && !isLoading && (
        <div ref={resultsContainerRef} className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6" />
            Your Astrological Insights
          </h2>
          {results.thisMonthForecast && (
            <ReportCard title="This Month's Forecast" icon={<CalendarDays className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.thisMonthForecast}</p>
            </ReportCard>
          )}
          {results.nextMonthForecast && (
            <ReportCard title="Next Month's Forecast" icon={<CalendarHeart className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.nextMonthForecast}</p>
            </ReportCard>
          )}
          {results.thisYearOutlook && (
            <ReportCard title={`This Year's Outlook (${currentDisplayYear})`} icon={<Crown className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.thisYearOutlook}</p>
            </ReportCard>
          )}
          {results.nextYearOutlook && (
            <ReportCard title={`Next Year's Outlook (${currentDisplayYear + 1})`} icon={<TrendingUp className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.nextYearOutlook}</p>
            </ReportCard>
          )}
          {results.yearAfterNextOutlook && (
            <ReportCard title={`Outlook for ${currentDisplayYear + 2}`} icon={<Zap className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.yearAfterNextOutlook}</p>
            </ReportCard>
          )}
          {results.generalSignificantEvents && (
            <ReportCard title="Other Significant Events" icon={<Sparkles className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.generalSignificantEvents}</p>
            </ReportCard>
          )}
        </div>
      )}
    </div>
  );
}
