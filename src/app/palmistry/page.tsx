
'use client';

import { useState } from 'react';
import { analyzePalmImage, type AnalyzePalmImageOutput } from '@/ai/flows/analyze-palm-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Hand, Sparkles, Heart, Brain, LineChart, BookOpen, Zap, TrendingUp, ShieldAlert } from 'lucide-react';
import { ImageUploader } from '@/components/common/image-uploader';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useTranslation } from '@/context/language-context';

export default function PalmistryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzePalmImageOutput | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleAnalysis = async () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image',
        description: 'Please upload an image of your palm first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await analyzePalmImage({ palmImageDataUri: imageDataUri });
      setResult(analysis);
      
      if (user) {
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          type: 'palmistry',
          name: `${t('results.type_palmistry')} from ${format(new Date(), 'PPP p')}`,
          data: analysis,
          createdAt: serverTimestamp(),
        });
      }

    } catch (error) {
      console.error('Error analyzing palm image:', error);
      toast({
        title: t('common.error'),
        description: 'Failed to analyze your palm. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClear = () => {
    setImageDataUri(null);
    setResult(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold">{t('palmistry.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('palmistry.subtitle')}</p>
      </div>

      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('palmistry.upload_title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader 
            onImageUpload={setImageDataUri} 
            onImageClear={handleImageClear}
            disabled={isLoading}
          />
          <Button onClick={handleAnalysis} disabled={isLoading || !imageDataUri} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('palmistry.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('palmistry.read_palm_button')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
          <h2 className="font-headline text-4xl text-center">{t('palmistry.result_title')}</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="text-accent" /> {t('palmistry.summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LineChart className="text-accent" /> {t('palmistry.life_line')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.lifeLine}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="text-accent" /> {t('palmistry.head_line')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.headLine}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart className="text-accent" /> {t('palmistry.heart_line')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.heartLine}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Hand className="text-accent" /> {t('palmistry.fate_line')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.fateLine}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Zap className="text-accent" /> {t('palmistry.probable_events')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.probableEvents}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="text-accent" /> {t('palmistry.future_outlook')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.futureOutlook}</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldAlert className="text-accent" /> {t('palmistry.limitations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{result.limitations}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
