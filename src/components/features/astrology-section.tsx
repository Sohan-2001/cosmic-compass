
'use client';
import { useState, useRef, useEffect } from 'react';
import { AstrologyForm, type AstrologyFormValues } from '@/components/forms/astrology-form';
import { getCombinedAstrologyReportAction } from '@/app/actions/astrology-actions';
import type { CombinedAstrologyReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { CalendarHeart, Crown, Zap, AlertTriangle, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

export function AstrologySection() {
  const [results, setResults] = useState<CombinedAstrologyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: AstrologyFormValues) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

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
          {results.monthlyForecast && (
            <ReportCard title="Monthly Forecast" icon={<CalendarHeart className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.monthlyForecast}</p>
            </ReportCard>
          )}
          {results.yearlyOutlook && (
            <ReportCard title="Yearly Outlook" icon={<Crown className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.yearlyOutlook}</p>
            </ReportCard>
          )}
          {results.significantEvents && (
            <ReportCard title="Significant Events Prediction" icon={<Zap className="h-6 w-6" />}>
              <p className="whitespace-pre-wrap">{results.significantEvents}</p>
            </ReportCard>
          )}
        </div>
      )}
    </div>
  );
}
