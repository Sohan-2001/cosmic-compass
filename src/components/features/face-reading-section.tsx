
'use client';
import { useState, useRef, useEffect } from 'react';
import { FaceUploadForm, type FaceUploadFormValues } from '@/components/forms/face-upload-form';
import { getFaceReadingAction, translateFaceReadingReportAction } from '@/app/actions/face-reading-actions';
import type { FaceReadingReport, FaceReadingReportTexts, ProminentFeature } from '@/lib/types';
import { ReportCard } from './report-card';
import { useToast } from '@/hooks/use-toast';
import { Smile, AlertTriangle, Sparkles, UserCheck, Languages, Eye, Brain, Zap } from 'lucide-react';
import { LoadingSpinner } from '../ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const availableLanguages = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Español" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Hindi", label: "हिन्दी" },
  { value: "Bengali", label: "বাংলা (Bangla)" },
];

export function FaceReadingSection() {
  const [originalReport, setOriginalReport] = useState<FaceReadingReport | null>(null);
  const [displayedReport, setDisplayedReport] = useState<FaceReadingReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const { toast } = useToast();
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (values: FaceUploadFormValues) => {
    setIsLoading(true);
    setError(null);
    setOriginalReport(null);
    setDisplayedReport(null);
    setSelectedLanguage("English");

    const response = await getFaceReadingAction(values);

    if (response.error) {
      setError(response.error);
      toast({
        title: 'Face Reading Error',
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
    const reportTexts: FaceReadingReportTexts = {
        overallImpression: originalReport.overallImpression,
        prominentFeatures: originalReport.prominentFeatures?.map(pf => ({ feature: pf.feature, interpretation: pf.interpretation })),
        personalityInsights: originalReport.personalityInsights,
        potentialLifeAspects: originalReport.potentialLifeAspects,
    };

    const translatedResponse = await translateFaceReadingReportAction(reportTexts, lang);
    if ('error' in translatedResponse) {
        setError(translatedResponse.error);
        toast({
            title: 'Translation Error',
            description: translatedResponse.error,
            variant: 'destructive',
        });
        setDisplayedReport(originalReport); 
    } else {
        const fullyTypedReport: FaceReadingReport = {
            overallImpression: translatedResponse.overallImpression || null,
            prominentFeatures: translatedResponse.prominentFeatures?.map(pf => ({ feature: pf.feature, interpretation: pf.interpretation || ""})) || null,
            personalityInsights: translatedResponse.personalityInsights?.map(pi => pi || "") || null,
            potentialLifeAspects: translatedResponse.potentialLifeAspects || null,
        };
        setDisplayedReport(fullyTypedReport);
    }
    setIsTranslating(false);
  };

  useEffect(() => {
    if (displayedReport && !isLoading && !isTranslating && resultContainerRef.current) {
      resultContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [displayedReport, isLoading, isTranslating]);

  const hasContent = displayedReport?.overallImpression || 
                     (displayedReport?.prominentFeatures && displayedReport.prominentFeatures.length > 0) ||
                     (displayedReport?.personalityInsights && displayedReport.personalityInsights.length > 0) ||
                     displayedReport?.potentialLifeAspects;

  return (
    <div className="space-y-8">
      <FaceUploadForm onSubmit={handleSubmit} isLoading={isLoading} />

      {(isLoading || isTranslating) && (
         <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-lg bg-card/50">
          <LoadingSpinner size={48} />
          <p className="text-base md:text-lg font-headline text-accent animate-pulse">
            {isLoading ? "Reading your facial expressions..." : "Translating your facial insights..."}
          </p>
        </div>
      )}

      {error && !isLoading && !isTranslating && (
         <ReportCard title="Error" icon={<AlertTriangle className="h-6 w-6 text-destructive" />}>
           <p className="text-destructive">{error}</p>
         </ReportCard>
      )}

      {displayedReport && hasContent && !isLoading && !isTranslating && !error && (
        <div ref={resultContainerRef} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl md:text-3xl font-headline text-accent flex items-center gap-2">
              <Smile className="h-7 w-7" />
              Your Face Reading
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
          
          {displayedReport.overallImpression && (
            <ReportCard title="Overall Impression" icon={<UserCheck className="h-6 w-6 text-accent" />}>
              <p className="whitespace-pre-wrap text-sm md:text-base">{displayedReport.overallImpression}</p>
            </ReportCard>
          )}

          {displayedReport.prominentFeatures && displayedReport.prominentFeatures.length > 0 && (
            <ReportCard title="Prominent Features Analysis" icon={<Eye className="h-6 w-6 text-accent" />}>
              <div className="space-y-3">
                {displayedReport.prominentFeatures.map((item, index) => (
                  <div key={index}>
                    <h4 className="font-semibold text-foreground">{item.feature}</h4>
                    <p className="whitespace-pre-wrap text-sm">{item.interpretation}</p>
                  </div>
                ))}
              </div>
            </ReportCard>
          )}

          {displayedReport.personalityInsights && displayedReport.personalityInsights.length > 0 && (
            <ReportCard title="Personality Insights" icon={<Brain className="h-6 w-6 text-accent" />}>
              <ul className="list-disc list-inside space-y-1 pl-2">
                {displayedReport.personalityInsights.map((insight, index) => (
                  <li key={index} className="text-sm md:text-base">
                    {insight}
                  </li>
                ))}
              </ul>
            </ReportCard>
          )}

          {displayedReport.potentialLifeAspects && (
            <ReportCard title="Potential Life Aspects" icon={<Zap className="h-6 w-6 text-accent" />}>
               <p className="whitespace-pre-wrap text-sm md:text-base">{displayedReport.potentialLifeAspects}</p>
            </ReportCard>
          )}
        </div>
      )}
    </div>
  );
}
