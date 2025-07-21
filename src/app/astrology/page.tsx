
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { interpretAstrologicalChart, type InterpretAstrologicalChartOutput } from '@/ai/flows/interpret-astrological-chart';
import { getZodiacFromDate } from '@/ai/flows/get-zodiac-from-date';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Star, Calendar, Zap, TrendingUp, Check, X, WandSparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { PlacesAutocomplete } from '@/components/common/places-autocomplete';
import { ZodiacIcon } from '@/components/common/zodiac-icons';
import { format } from 'date-fns';
import { useTranslation } from '@/context/language-context';

type Step = 'input' | 'confirmation' | 'correction' | 'result';

const formSchema = z.object({
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  birthLocation: z.string().min(1, 'Birth location is required'),
  astrologySystem: z.string({ required_error: 'Please select an astrology system.' }),
  zodiacSign: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const handleApiError = (error: any, toast: (options: any) => void) => {
    console.error('API Error:', error);
    const errorMessage = error.message || '';
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        toast({
            title: 'Server is busy',
            description: 'The AI service is currently overloaded. Please try again in a moment.',
            variant: 'destructive',
        });
    } else {
        toast({
            title: 'Error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    }
};


export default function AstrologyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [determinedSign, setDeterminedSign] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretAstrologicalChartOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
      birthTime: '',
      birthLocation: '',
      astrologySystem: 'Vedic (Sidereal)',
      zodiacSign: '',
    },
  });

  const { watch } = form;
  const birthDate = watch('birthDate');
  
  async function handleInitialSubmit(values: FormValues) {
    setIsLoading(true);
    setDeterminedSign(null);
    try {
      const { zodiacSign } = await getZodiacFromDate({ birthDate: values.birthDate });
      setDeterminedSign(zodiacSign);
      setStep('confirmation');
    } catch (error) {
      handleApiError(error, toast);
      setStep('correction');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateChart() {
    setIsGenerating(true);
    setResult(null);

    const values = form.getValues();

    try {
      const chart = await interpretAstrologicalChart({
        birthDate: values.birthDate,
        birthTime: values.birthTime,
        birthLocation: values.birthLocation,
        astrologySystem: values.astrologySystem,
      });
      setResult(chart);
      setStep('result');

      if (user) {
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          type: 'astrology',
          name: `${t('results.type_astrology')} from ${format(new Date(), 'PPP p')}`,
          data: chart,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleApiError(error, toast);
    } finally {
      setIsGenerating(false);
    }
  }
  
  async function handleCorrectionSubmit() {
    const zodiacSign = form.getValues('zodiacSign');
    if (!zodiacSign) {
        toast({ title: 'Please select a sign', variant: 'destructive' });
        return;
    }
    await generateChart();
  }


  const renderInputForm = () => (
    <Card className="mb-8 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{t('astrology.form_title')}</CardTitle>
        <CardDescription>{t('astrology.form_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-6">
             <FormField
                control={form.control}
                name="astrologySystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('astrology.system_label')}</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an astrology system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Vedic (Sidereal)">Vedic (Sidereal)</SelectItem>
                        <SelectItem value="Western (Tropical)">Western (Tropical)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('astrology.system_description')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('astrology.birth_date_label')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('astrology.birth_time_label')}</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="birthLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('astrology.birth_location_label')}</FormLabel>
                  <FormControl>
                     <PlacesAutocomplete 
                      onLocationSelect={(location) => form.setValue('birthLocation', location, { shouldValidate: true })}
                      initialValue={field.value}
                     />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading || !birthDate} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('astrology.calculating_sign')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('astrology.continue_button')}
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderConfirmation = () => (
     <Form {...form}>
      <Card className="mb-8 bg-card/50 backdrop-blur-sm text-center animate-in fade-in-50">
        <CardHeader>
          <CardTitle>{t('astrology.confirmation_title')}</CardTitle>
          <CardDescription>{t('astrology.confirmation_subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {determinedSign && <ZodiacIcon sign={determinedSign} className="w-24 h-24 text-accent" />}
          <p className="text-4xl font-headline">{determinedSign}</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => generateChart()} disabled={isGenerating} size="lg">
              <Check className="mr-2" /> {t('astrology.yes_button')}
            </Button>
            <Button variant="outline" onClick={() => setStep('correction')} disabled={isGenerating}>
              <X className="mr-2" /> {t('astrology.no_button')}
            </Button>
          </div>
           <p className="text-xs text-muted-foreground mt-4">
            Note: Your final reading will use the '{form.getValues('astrologySystem')}' system you selected.
          </p>
        </CardContent>
      </Card>
    </Form>
  );
  
  const renderCorrection = () => (
    <Form {...form}>
      <Card className="mb-8 bg-card/50 backdrop-blur-sm animate-in fade-in-50">
        <CardHeader>
          <CardTitle>{t('astrology.correction_title')}</CardTitle>
          <CardDescription>{t('astrology.correction_description', {system: form.getValues('astrologySystem')})}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
                {t('astrology.correction_info')}
            </p>
          <Button
            onClick={() => generateChart()}
            disabled={isGenerating}
            className="w-full mt-6"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
            {t('astrology.generate_chart_button', { system: form.getValues('astrologySystem')})}
          </Button>
        </CardContent>
      </Card>
    </Form>
  );

  const renderResult = () => result && (
    <div className="space-y-6 animate-in fade-in-50">
      <h2 className="font-headline text-4xl text-center">{t('astrology.result_title')}</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="text-accent" /> {t('astrology.personality_traits')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.personalityTraits}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> {t('astrology.life_tendencies')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.lifeTendencies}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> {t('astrology.key_insights')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.keyInsights}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="text-accent" /> {t('astrology.next_month_forecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.nextMonthForecast}</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> {t('astrology.next_3_years_forecast')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.nextThreeYearsForecast}</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="text-accent" /> {t('astrology.significant_events')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.significantEvents}</p>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold">{t('astrology.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('astrology.subtitle')}</p>
      </div>

      {step === 'input' && renderInputForm()}
      {step === 'confirmation' && renderConfirmation()}
      {step === 'correction' && renderCorrection()}
      {step === 'result' && renderResult()}
      {(isGenerating && step !== 'result') && (
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-headline text-xl">{t('astrology.generating_chart')}</p>
            <p>{t('astrology.generating_chart_info')}</p>
        </div>
      )}
    </div>
  );
}
