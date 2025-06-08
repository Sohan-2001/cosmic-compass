
'use client';
import { useState, useRef, useEffect } from 'react';
import { LifetimeHoroscopeForm, type LifetimeHoroscopeFormValues } from '@/components/forms/lifetime-horoscope-form';
import { getLifetimeHoroscopeAction, translateLifetimeHoroscopeAction } from '@/app/actions/lifetime-horoscope-actions';
import type { LifetimeHoroscopeReport, YearlyForecast, LifetimeHoroscopeReportTexts } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Route, Languages, ScrollText } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';


const availableLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Bengali", label: "বাংলা (Bangla)" },
];

export function LifetimeHoroscopeSection() {
  const [originalReport, setOriginalReport] = useState<LifetimeHoroscopeReport | null>(null);
  const [displayedReport, setDisplayedReport] = useState<LifetimeHoroscopeReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const { toast } = useToast();
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: LifetimeHoroscopeFormValues) => {
    setIsLoading(true);
    setError(null);
    setOriginalReport(null);
    setDisplayedReport(null);
    setSelectedLanguage("English");

    const response = await getLifetimeHoroscopeAction(values);

    if ('error' in response) {
      setError(response.error);
      toast({
        title: 'Error Generating Lifetime Horoscope',
        description: response.error,
        variant: 'destructive',
      });
    } else {
      setOriginalReport(response);
      setDisplayedReport(response);
    }
    setIsLoading(false);
  };

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    if (!originalReport || !originalReport.forecasts) return;

    if (lang.toLowerCase() === "english") {
      setDisplayedReport(originalReport);
      return;
    }

    setIsTranslating(true);
    setError(null);
    const reportTexts: LifetimeHoroscopeReportTexts = {
        forecasts: originalReport.forecasts.map(f => ({ year: f.year, forecast: f.forecast })),
    };

    const translatedResponse = await translateLifetimeHoroscopeAction(reportTexts, lang);
    if ('error' in translatedResponse) {
        setError(translatedResponse.error);
        toast({
            title: 'Translation Error',
            description: translatedResponse.error,
            variant: 'destructive',
        });
        setDisplayedReport(originalReport); // Fallback to original
    } else {
        // Ensure translatedResponse.forecasts exists and maps correctly
        if (translatedResponse.forecasts) {
            setDisplayedReport({ forecasts: translatedResponse.forecasts.map(f => ({ year: f.year, forecast: f.forecast || ""})) });
        } else {
             setDisplayedReport(originalReport); // Fallback if structure is not as expected
        }
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
      <LifetimeHoroscopeForm onSubmit={handleSubmit} isLoading={isLoading} />

      {(isLoading || isTranslating) && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            {isLoading ? "Charting your entire lifetime journey..." : "Translating your lifetime journey..."}
          </p>
        </div>
      )}

      {error && !isLoading && !isTranslating && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {displayedReport && displayedReport.forecasts && displayedReport.forecasts.length > 0 && !isLoading && !isTranslating && (
        <div ref={resultsContainerRef} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2">
              <Route className="h-7 w-7" />
              Your Lifetime Horoscope
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

          <ReportCard title="Yearly Overviews" icon={<ScrollText className="h-6 w-6" />}>
            <ScrollArea className="h-[500px] w-full pr-4"> {/* Added pr-4 for scrollbar spacing */}
              <div className="space-y-4">
                {displayedReport.forecasts.map((entry) => (
                  <div key={entry.year} className="pb-2 border-b border-border/50 last:border-b-0">
                    <h4 className="text-md font-headline text-primary mb-1">{entry.year}</h4>
                    <p className="whitespace-pre-wrap text-sm">{entry.forecast}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </ReportCard>
        </div>
      )}
    </div>
  );
}
