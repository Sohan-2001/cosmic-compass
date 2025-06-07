
'use client';
import { useState, useRef, useEffect } from 'react';
import { PalmUploadForm, type PalmUploadFormValues } from '@/components/forms/palm-upload-form';
import { getPalmReadingAction } from '@/app/actions/palmistry-actions';
import type { PalmReadingReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { Hand, AlertTriangle } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';

export function PalmReadingSection() {
  const [result, setResult] = useState<PalmReadingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: PalmUploadFormValues) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const response = await getPalmReadingAction(values);

    if ('error' in response) {
      setError(response.error);
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setResult(response);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (result?.reading && !isLoading && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result, isLoading]);

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

      {result?.reading && !isLoading && (
        <div ref={resultContainerRef}>
          <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2 mb-4">
            <Hand className="h-6 w-6" />
            Your Palm Reading
          </h2>
          <ReportCard title="Insights from Your Palm" icon={<Hand className="h-6 w-6" />}>
            <p className="whitespace-pre-wrap">{result.reading}</p>
          </ReportCard>
        </div>
      )}
    </div>
  );
}
