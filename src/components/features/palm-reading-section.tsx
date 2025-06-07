
'use client';
import { useState, useRef, useEffect } from 'react';
import { PalmUploadForm, type PalmUploadFormValues } from '@/components/forms/palm-upload-form';
import { getPalmReadingAction } from '@/app/actions/palmistry-actions';
import type { PalmReadingReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { Hand, AlertTriangle, Sparkles, ListChecks, BookOpenText } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

export function PalmReadingSection() {
  const [report, setReport] = useState<PalmReadingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: PalmUploadFormValues) => {
    setIsLoading(true);
    setError(null);
    setReport(null);

    const response = await getPalmReadingAction(values);

    if (response.error) {
      setError(response.error);
      toast({
        title: 'Palm Reading Error',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setReport(response);
      setError(null); 
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (report && !isLoading && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [report, isLoading]);

  const hasContent = report?.summary || (report?.keyPredictions && report.keyPredictions.length > 0) || report?.detailedAnalysis;

  return (
    <div className="space-y-8">
      <PalmUploadForm onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && (
         <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            Deciphering the lines of your fate...
          </p>
        </div>
      )}

      {error && !isLoading && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {report && hasContent && !isLoading && !error && (
        <div ref={resultContainerRef}>
          <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2 mb-6">
            <Hand className="h-7 w-7" />
            Your Palm Reading
          </h2>
          <ReportCard title="Insights from Your Palm" icon={<Sparkles className="h-6 w-6 text-accent" />}>
            <div className="space-y-6">
              {report.summary && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-2 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-accent" />
                    Summary
                  </h3>
                  <p className="whitespace-pre-wrap text-sm md:text-base">{report.summary}</p>
                </div>
              )}

              {report.keyPredictions && report.keyPredictions.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-3 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-accent" />
                    Key Predictions
                  </h3>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    {report.keyPredictions.map((prediction, index) => (
                      <li key={index} className="text-sm md:text-base">
                        {prediction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {report.detailedAnalysis && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-2 flex items-center">
                    <BookOpenText className="mr-2 h-5 w-5 text-accent" />
                    Detailed Analysis
                  </h3>
                  <p className="whitespace-pre-wrap text-sm md:text-base">{report.detailedAnalysis}</p>
                </div>
              )}
            </div>
          </ReportCard>
        </div>
      )}
    </div>
  );
}
