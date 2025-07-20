
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

export default function FaceReadingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<InterpretFaceImageOutput | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

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
          name: `Face Reading from ${format(new Date(), 'PPP p')}`,
          data: analysis,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error analyzing face image:', error);
      toast({
        title: 'Error',
        description: 'Failed to analyze the face. Please try again.',
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
        <h1 className="font-headline text-5xl font-bold">AI Face Reading</h1>
        <p className="text-muted-foreground mt-2">Uncover insights into personality and fortune from facial features.</p>
      </div>

      <Card className="mb-8 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Upload a Face Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ImageUploader 
            onImageUpload={setImageDataUri} 
            onImageClear={handleImageClear}
            disabled={isLoading}
          />
          <div className="space-y-2">
            <Label htmlFor="description">Optional Description</Label>
            <Textarea
              id="description"
              placeholder="Any additional information (e.g., age, context)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleAnalysis} disabled={isLoading || !imageDataUri} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Read This Face
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <div className="space-y-6 animate-in fade-in-50">
          <h2 className="font-headline text-4xl text-center">Your Face Reading Analysis</h2>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="text-accent" /> Summary</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.summary}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="text-accent" /> Personality Insights</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.personalityInsights}</p></CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-accent" /> Fortune Prediction</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{result.fortunePrediction}</p></CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
