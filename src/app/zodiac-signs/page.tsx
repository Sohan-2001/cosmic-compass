
'use client';

import { useState, useEffect } from 'react';
import type { GetZodiacDetailsOutput } from '@/ai/flows/get-zodiac-details';
import { horoscopes } from '@/data/horoscopes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Star, Heart, Briefcase, Bone, Shield, Sun, Droplets, Wind, Mountain, Languages } from 'lucide-react';
import { ZodiacIcon } from '@/components/common/zodiac-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const elementIcons = {
    Fire: <Sun className="h-4 w-4" />,
    Earth: <Mountain className="h-4 w-4" />,
    Air: <Wind className="h-4 w-4" />,
    Water: <Droplets className="h-4 w-4" />,
};

type ZodiacDetailsWithTranslations = GetZodiacDetailsOutput & {
    id: string;
    translations: Record<string, GetZodiacDetailsOutput>;
};

const languages = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'Chinese (Simplified)', label: 'Chinese (Simplified)' },
    { value: 'Russian', label: 'Russian' },
    { value: 'Arabic', label: 'Arabic' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Urdu', label: 'Urdu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Odia', label: 'Odia' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Assamese', label: 'Assamese' },
];

export default function ZodiacSignsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [allZodiacData, setAllZodiacData] = useState<Record<string, ZodiacDetailsWithTranslations>>({});
  const [selectedSign, setSelectedSign] = useState<ZodiacDetailsWithTranslations | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const { toast } = useToast();

  useEffect(() => {
    const fetchZodiacData = async () => {
      setIsLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'zodiac_signs'));
        if (querySnapshot.empty) {
            toast({
                title: 'No Data Found',
                description: 'The zodiac sign data has not been loaded into the database yet.',
                variant: 'destructive',
            });
            return;
        }
        const data: Record<string, ZodiacDetailsWithTranslations> = {};
        querySnapshot.forEach((doc) => {
          data[doc.id] = { id: doc.id, ...(doc.data() as Omit<ZodiacDetailsWithTranslations, 'id'>) };
        });
        setAllZodiacData(data);
      } catch (error) {
        console.error('Error fetching zodiac details from Firestore:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch zodiac data from the database.`,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchZodiacData();
  }, [toast]);

  const handleSignSelect = (sign: string) => {
    const signData = allZodiacData[sign];
    if (signData) {
        setSelectedSign(signData);
        setSelectedLanguage('English');
    } else if (!isLoading) {
        toast({
            title: 'Data not available',
            description: `Details for ${sign} could not be found.`,
            variant: 'destructive'
        });
    }
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };
  
  const getDisplayData = (): GetZodiacDetailsOutput | null => {
      if (!selectedSign) return null;
      if (selectedLanguage === 'English' || !selectedSign.translations) {
          return selectedSign;
      }
      return selectedSign.translations[selectedLanguage] || selectedSign;
  };
  
  const displayData = getDisplayData();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold">Explore the Zodiac Signs</h1>
        <p className="text-muted-foreground mt-2">Select a sign to uncover its detailed astrological profile.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {horoscopes.map(({ sign }) => (
          <Button
            key={sign}
            variant={selectedSign?.sign === sign ? 'secondary' : 'outline'}
            onClick={() => handleSignSelect(sign)}
            disabled={isLoading}
            className="flex flex-col h-24 gap-2"
          >
            <ZodiacIcon sign={sign} className="w-8 h-8 text-accent" />
            <span className="font-semibold">{sign}</span>
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">Loading Zodiac Profiles...</p>
        </div>
      )}

      {displayData && selectedSign && (
        <Card className="animate-in fade-in-50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-4">
              <ZodiacIcon sign={selectedSign.sign} className="w-16 h-16 text-accent" />
            </div>
            <CardTitle className="font-headline text-5xl mt-4">{displayData.sign}</CardTitle>
            <div className="flex justify-center items-center gap-4 text-muted-foreground mt-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1.5">
                    {elementIcons[selectedSign.element as keyof typeof elementIcons]}
                    {displayData.element}
                </Badge>
                <Badge variant="outline">{displayData.modality}</Badge>
                <Badge variant="outline">{displayData.rulingPlanet}</Badge>
            </div>
             <p className="text-xl text-muted-foreground mt-2">{displayData.symbol}</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <Separator />
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Shield /> Strengths</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {displayData.strengths.map(s => <Badge key={s}>{s}</Badge>)}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Bone /> Weaknesses</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {displayData.weaknesses.map(w => <Badge variant="destructive" key={w}>{w}</Badge>)}
                  </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Star /> Personality</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.personality}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Heart /> Love & Relationships</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.loveAndRelationships}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase /> Career & Work</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.career}</p></CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4 p-6">
            <Separator />
             <div className="flex items-center gap-2 pt-2">
                <Select onValueChange={handleLanguageChange} value={selectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem 
                                key={lang.value} 
                                value={lang.value}
                                disabled={lang.value !== 'English' && !selectedSign.translations?.[lang.value]}
                            >
                               {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <p className="text-sm text-muted-foreground">
                    {Object.keys(selectedSign.translations || {}).length + 1} languages available.
                 </p>
            </div>
          </CardFooter>
        </Card>
      )}

      {!selectedSign && !isLoading && (
        <div className="text-center text-muted-foreground py-16">
            <Sparkles className="mx-auto h-12 w-12 mb-4 text-accent" />
            <p className="text-lg">Select a zodiac sign above to see its cosmic details.</p>
        </div>
      )}
    </div>
  );
}
