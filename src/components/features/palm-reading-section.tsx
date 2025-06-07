
'use client';
import { useState, useRef, useEffect } from 'react';
import { PalmUploadForm, type PalmUploadFormValues } from '@/components/forms/palm-upload-form';
import { getPalmReadingAction, translatePalmReadingReportAction, type PalmReadingReportTexts } from '@/app/actions/palmistry-actions';
import type { PalmReadingReport } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { Hand, AlertTriangle, Sparkles, ListChecks, BookOpenText, Languages } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '../ui/button';

const availableLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Hindi", label: "हिन्दी" },
];

export function PalmReadingSection() {
  const [originalReport, setOriginalReport] = useState<PalmReadingReport | null>(null);
  const [displayedReport, setDisplayedReport] = useState<PalmReadingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const { toast } = useToast();
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: PalmUploadFormValues) => {
    setIsLoading(true);
    setError(null);
    setOriginalReport(null);
    setDisplayedReport(null);
    setSelectedLanguage("English");

    const response = await getPalmReadingAction(values);

    if (response.error) {
      setError(response.error);
      toast({
        title: 'Palm Reading Error',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setOriginalReport(response);
      setDisplayedReport(response);
      setError(null); 
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
    const reportTexts: PalmReadingReportTexts = {
        summary: originalReport.summary,
        keyPredictions: originalReport.keyPredictions,
        detailedAnalysis: originalReport.detailedAnalysis,
    };

    const translatedResponse = await translatePalmReadingReportAction(reportTexts, lang);
    if ('error' in translatedResponse) {
        setError(translatedResponse.error);
        toast({
            title: 'Translation Error',
            description: translatedResponse.error,
            variant: 'destructive',
        });
        setDisplayedReport(originalReport); // Fallback to original
    } else {
        setDisplayedReport(translatedResponse as PalmReadingReport);
    }
    setIsTranslating(false);
  };

  useEffect(() => {
    if (displayedReport && !isLoading && !isTranslating && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [displayedReport, isLoading, isTranslating]);

  const hasContent = displayedReport?.summary || (displayedReport?.keyPredictions && displayedReport.keyPredictions.length > 0) || displayedReport?.detailedAnalysis;

  return (
    <div className="space-y-8">
      <PalmUploadForm onSubmit={handleSubmit} isLoading={isLoading} />

      {(isLoading || isTranslating) && (
         <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            {isLoading ? "Deciphering the lines of your fate..." : "Translating the lines of your fate..."}
          </p>
        </div>
      )}

      {error && !isLoading && !isTranslating && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {displayedReport && hasContent && !isLoading && !isTranslating && !error && (
        <div ref={resultContainerRef}>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2">
              <Hand className="h-7 w-7" />
              Your Palm Reading
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
          <ReportCard title="Insights from Your Palm" icon={<Sparkles className="h-6 w-6 text-accent" />}>
            <div className="space-y-6">
              {displayedReport.summary && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-2 flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 text-accent" />
                    Summary
                  </h3>
                  <p className="whitespace-pre-wrap text-sm md:text-base">{displayedReport.summary}</p>
                </div>
              )}

              {displayedReport.keyPredictions && displayedReport.keyPredictions.length > 0 && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-3 flex items-center">
                    <ListChecks className="mr-2 h-5 w-5 text-accent" />
                    Key Predictions
                  </h3>
                  <ul className="list-disc list-inside space-y-2 pl-2">
                    {displayedReport.keyPredictions.map((prediction, index) => (
                      <li key={index} className="text-sm md:text-base">
                        {prediction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {displayedReport.detailedAnalysis && (
                <div>
                  <h3 className="text-lg md:text-xl font-headline text-foreground mb-2 flex items-center">
                    <BookOpenText className="mr-2 h-5 w-5 text-accent" />
                    Detailed Analysis
                  </h3>
                  <p className="whitespace-pre-wrap text-sm md:text-base">{displayedReport.detailedAnalysis}</p>
                </div>
              )}
            </div>
          </ReportCard>
        </div>
      )}
    </div>
  );
}
