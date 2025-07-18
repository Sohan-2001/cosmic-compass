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
import { horoscopes } from '@/data/horoscopes';
import { ZodiacIcon } from '@/components/common/zodiac-icons';

type Step = 'input' | 'confirmation' | 'correction' | 'result';

const formSchema = z.object({
  birthDate: z.string().min(1, 'Birth date is required'),
  birthTime: z.string().min(1, 'Birth time is required'),
  birthLocation: z.string().min(1, 'Birth location is required'),
  astrologySystem: z.string({ required_error: 'Please select an astrology system.' }),
  zodiacSign: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AstrologyPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<Step>('input');
  const [determinedSign, setDeterminedSign] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretAstrologicalChartOutput | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: '',
      birthTime: '',
      birthLocation: '',
      astrologySystem: 'Western (Tropical)',
      zodiacSign: '',
    },
  });

  const { watch } = form;
  const birthDate = watch('birthDate');
  
  async function handleInitialSubmit(values: FormValues) {
    setIsLoading(true);
    setDeterminedSign(null);
    try {
      // The getZodiacFromDate flow defaults to Western astrology, which is fine for this initial check.
      const { zodiacSign } = await getZodiacFromDate({ birthDate: values.birthDate });
      setDeterminedSign(zodiacSign);
      setStep('confirmation');
    } catch (error) {
      console.error('Error determining zodiac sign:', error);
      toast({
        title: 'Error',
        description: 'Could not determine zodiac sign. Please check the birth date or enter it manually.',
        variant: 'destructive',
      });
      setStep('correction');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateChart(manualSign?: string) {
    setIsGenerating(true);
    setResult(null);

    const values = form.getValues();
    const finalSign = manualSign || determinedSign;

    try {
      const chart = await interpretAstrologicalChart({
        ...values,
        birthDate: `${values.birthDate} (Zodiac: ${finalSign})`,
      });
      setResult(chart);
      setStep('result');

      if (user) {
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          type: 'astrology',
          data: chart,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error interpreting astrological chart:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate your astrological chart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const renderInputForm = () => (
    <Card className="mb-8 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Your Birth Information</CardTitle>
        <CardDescription>Provide accurate details for the most precise reading.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleInitialSubmit)} className="space-y-6">
             <FormField
                control={form.control}
                name="astrologySystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Astrology System</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an astrology system" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Western (Tropical)">Western (Tropical)</SelectItem>
                        <SelectItem value="Vedic (Sidereal)">Vedic (Sidereal)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the system you prefer for your reading.
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
                    <FormLabel>Birth Date</FormLabel>
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
                    <FormLabel>Birth Time</FormLabel>
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
                  <FormLabel>Birth Location (City, Country)</FormLabel>
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
                  Calculating Sign...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Continue
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
          <CardTitle>Is this your Zodiac Sign?</CardTitle>
          <CardDescription>(Based on Western Astrology)</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {determinedSign && <ZodiacIcon sign={determinedSign} className="w-24 h-24 text-accent" />}
          <p className="text-4xl font-headline">{determinedSign}</p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => generateChart()} disabled={isGenerating} size="lg">
              <Check className="mr-2" /> Yes, Correct
            </Button>
            <Button variant="outline" onClick={() => setStep('correction')} disabled={isGenerating}>
              <X className="mr-2" /> No, Incorrect
            </Button>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
  
  const renderCorrection = () => (
    <Form {...form}>
      <Card className="mb-8 bg-card/50 backdrop-blur-sm animate-in fade-in-50">
        <CardHeader>
          <CardTitle>Select Your Correct Zodiac Sign</CardTitle>
          <CardDescription>Please choose your sign from the list below to proceed.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="zodiacSign"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Zodiac sign..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {horoscopes.map(h => (
                      <SelectItem key={h.sign} value={h.sign}>{h.sign}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            onClick={() => generateChart(form.getValues('zodiacSign'))}
            disabled={isGenerating || !form.watch('zodiacSign')}
            className="w-full mt-6"
          >
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WandSparkles className="mr-2 h-4 w-4" />}
            Generate My Chart
          </Button>
        </CardContent>
      </Card>
    </Form>
  );

  const renderResult = () => result && (
    <div className="space-y-6 animate-in fade-in-50">
      <h2 className="font-headline text-4xl text-center">Your Cosmic Interpretation</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Star className="text-accent" /> Personality Traits</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.personalityTraits}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Life Tendencies</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.lifeTendencies}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.keyInsights}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar className="text-accent" /> Next Month Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.nextMonthForecast}</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> Next 3 Years Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{result.nextThreeYearsForecast}</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="text-accent" /> Significant Events</CardTitle>
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
        <h1 className="font-headline text-5xl font-bold">AI Astrology Reading</h1>
        <p className="text-muted-foreground mt-2">Enter your birth details to reveal your cosmic blueprint.</p>
      </div>

      {step === 'input' && renderInputForm()}
      {step === 'confirmation' && renderConfirmation()}
      {step === 'correction' && renderCorrection()}
      {step === 'result' && renderResult()}
      {(isGenerating && step !== 'result') && (
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="font-headline text-xl">Generating Your Cosmic Chart...</p>
            <p>This can take a moment. The cosmos is vast!</p>
        </div>
      )}
    </div>
  );
}
