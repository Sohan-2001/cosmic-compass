
'use client';

import { useState } from 'react';
import { getZodiacDetails, type GetZodiacDetailsOutput } from '@/ai/flows/get-zodiac-details';
import { translateObject } from '@/ai/flows/translate-text';
import { horoscopeSigns } from '@/data/horoscopes';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Star, Heart, Briefcase, Bone, Shield, Sun, Droplets, Wind, Mountain, Languages } from 'lucide-react';
import { ZodiacIcon } from '@/components/common/zodiac-icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useTranslation } from '@/context/language-context';
import { languages as allLanguages } from '@/data/languages';

const elementIcons = {
    Fire: <Sun className="h-4 w-4" />,
    Earth: <Mountain className="h-4 w-4" />,
    Air: <Wind className="h-4 w-4" />,
    Water: <Droplets className="h-4 w-4" />,
};

type ZodiacDetailsWithTranslations = GetZodiacDetailsOutput & {
    id: string;
    translations?: Record<string, GetZodiacDetailsOutput>;
};

export default function ZodiacSignsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [zodiacCache, setZodiacCache] = useState<Record<string, ZodiacDetailsWithTranslations>>({});
  const [selectedSign, setSelectedSign] = useState<ZodiacDetailsWithTranslations | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSignSelect = async (sign: string) => {
    setSelectedSign(null);
    setIsLoading(true);
    setSelectedLanguage('English');

    if (zodiacCache[sign]) {
      setSelectedSign(zodiacCache[sign]);
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, 'zodiac_signs', sign);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const signData = { id: docSnap.id, ...docSnap.data() } as ZodiacDetailsWithTranslations;
        setSelectedSign(signData);
        setZodiacCache(prev => ({ ...prev, [sign]: signData }));
      } else {
        toast({ title: t('zodiac.fetching_new_data'), description: t('zodiac.generating_profile', { sign }) });
        const details = await getZodiacDetails({ sign });
        const newSignData: ZodiacDetailsWithTranslations = { ...details, id: sign, translations: {} };
        
        await setDoc(docRef, newSignData);
        
        setSelectedSign(newSignData);
        setZodiacCache(prev => ({ ...prev, [sign]: newSignData }));
        toast({ title: t('common.success'), description: t('zodiac.success_generated')});
      }
    } catch (error) {
      console.error('Error handling sign selection:', error);
      toast({
        title: t('common.error'),
        description: `Failed to get or generate details for ${sign}.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setSelectedLanguage(language);
    if (!selectedSign || language === 'English') {
        return;
    }
    
    if (selectedSign.translations?.[language]) {
        return;
    }

    setIsTranslating(true);
    try {
        const { translations, id, ...originalData } = selectedSign;

        const { translatedObject } = await translateObject({
            objectToTranslate: originalData,
            targetLanguage: language
        });
        const translatedData = translatedObject as GetZodiacDetailsOutput;

        const docRef = doc(db, 'zodiac_signs', selectedSign.id);
        await updateDoc(docRef, {
            [`translations.${language}`]: translatedData
        });

        const updatedSign = {
            ...selectedSign,
            translations: {
                ...selectedSign.translations,
                [language]: translatedData,
            }
        };
        setSelectedSign(updatedSign);
        setZodiacCache(prev => ({ ...prev, [selectedSign.id]: updatedSign }));

    } catch (error) {
         console.error('Translation error:', error);
         toast({ title: t('common.error'), description: 'Failed to translate.', variant: 'destructive' });
    } finally {
        setIsTranslating(false);
    }
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
        <h1 className="font-headline text-5xl font-bold">{t('zodiac.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('zodiac.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
        {horoscopeSigns.map((sign) => (
          <Button
            key={sign}
            variant={selectedSign?.sign === sign ? 'secondary' : 'outline'}
            onClick={() => handleSignSelect(sign)}
            disabled={isLoading}
            className="flex flex-col h-24 gap-2"
          >
            <ZodiacIcon sign={sign} className="w-8 h-8 text-accent" />
            <span className="font-semibold">{t(`horoscope.${sign}.sign`)}</span>
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg">{t('zodiac.loading_profile')}</p>
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
                  <CardHeader><CardTitle className="flex items-center gap-2"><Shield /> {t('zodiac.strengths')}</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {displayData.strengths.map(s => <Badge key={s}>{s}</Badge>)}
                  </CardContent>
              </Card>
              <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Bone /> {t('zodiac.weaknesses')}</CardTitle></CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                      {displayData.weaknesses.map(w => <Badge variant="destructive" key={w}>{w}</Badge>)}
                  </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Star /> {t('zodiac.personality')}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.personality}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Heart /> {t('zodiac.love_and_relationships')}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.loveAndRelationships}</p></CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase /> {t('zodiac.career_and_work')}</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{displayData.career}</p></CardContent>
            </Card>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4 p-6">
            <Separator />
             <div className="flex items-center gap-2 pt-2">
                <Select onValueChange={handleLanguageChange} value={selectedLanguage}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('zodiac.select_language')} />
                    </SelectTrigger>
                    <SelectContent>
                        {allLanguages.map(lang => (
                            <SelectItem 
                                key={lang.value} 
                                value={lang.value}
                            >
                               {lang.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 {isTranslating ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('zodiac.translating')}
                    </div>
                 ) : (
                    <p className="text-sm text-muted-foreground">
                        {t('zodiac.languages_available', {count: Object.keys(selectedSign.translations || {}).length + 1})}
                    </p>
                 )}
            </div>
          </CardFooter>
        </Card>
      )}

      {!selectedSign && !isLoading && (
        <div className="text-center text-muted-foreground py-16">
            <Sparkles className="mx-auto h-12 w-12 mb-4 text-accent" />
            <p className="text-lg">{t('zodiac.select_prompt')}</p>
        </div>
      )}
    </div>
  );
}
