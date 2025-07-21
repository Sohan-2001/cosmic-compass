
'use client';

import { useState } from 'react';
import { interpretFaceImage, type InterpretFaceImageOutput } from '@/ai/flows/interpret-face-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Sparkles, Star } from 'lucide-react';
import { ImageUploader } from '@/components/common/image-uploader';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { useTranslation } from '@/context/language-context';

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

export default function FaceReadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterpretFaceImageOutput | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleAnalysis = async () => {
    if (!imageDataUri) {
      toast({
        title: 'No Image',
        description: 'Please upload an image of a face first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await interpretFaceImage({ photoDataUri: imageDataUri, description });
      setResult(analysis);

      if (user) {
        await addDoc(collection(db, 'results'), {
          userId: user.uid,
          type: 'face-reading',
          name: `${t('results.type_face_reading')} from ${format(new Date(), 'PPP p')}`,
          data: analysis,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleApiError(error, toast);
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
        <h1 className="font-headline text-5xl font-bold">{t('face_reading.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('face_reading.subtitle')}</p>
      </div>

      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('face_reading.upload_title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader 
            onImageUpload={setImageDataUri} 
            onImageClear={handleImageClear}
            disabled={isLoading}
          />
          <div className="space-y-2">
            <Label htmlFor="description">{t('face_reading.optional_description')}</Label>
            <Textarea
              id="description"
              placeholder={t('face_reading.description_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleAnalysis} disabled={isLoading || !imageDataUri} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('face_reading.analyzing')}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {t('face_reading.read_face_button')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
          <h2 className="font-headline text-4xl text-center">{t('face_reading.result_title')}</h2>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-accent" /> {t('face_reading.summary')}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="text-accent" /> {t('face_reading.personality_insights')}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.personalityInsights}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> {t('face_reading.fortune_prediction')}</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.fortunePrediction}</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
