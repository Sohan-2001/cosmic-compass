
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { translateObject } from '@/ai/flows/translate-text';
import { uiText as englishText } from '@/data/ui-text';
import { languages } from '@/data/languages';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type Translations = typeof englishText;

interface LanguageContextType {
  language: string;
  translations: Translations;
  setLanguage: (language: string) => Promise<void>;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState('English');
  const [translations, setTranslations] = useState<Translations>(englishText);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [tempSelectedLanguage, setTempSelectedLanguage] = useState('English');

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    const findValue = (obj: any, keyParts: string[]) => {
      return keyParts.reduce((acc, currentKey) => {
        return acc && acc[currentKey] !== undefined ? acc[currentKey] : undefined;
      }, obj);
    };

    let translatedText = findValue(translations, keys);

    if (translatedText === undefined) {
      const fallbackText = findValue(englishText, keys);
      translatedText = fallbackText || key;
    }

    if (typeof translatedText === 'string' && replacements) {
      Object.entries(replacements).forEach(([keyToReplace, value]) => {
        translatedText = translatedText.replace(`{${keyToReplace}}`, String(value));
      });
    }

    return translatedText;
  }, [translations]);

  const setLanguage = useCallback(async (newLanguage: string) => {
    if (newLanguage === language) return;

    localStorage.setItem('selectedLanguage', newLanguage);
    setLanguageState(newLanguage);

    if (newLanguage === 'English') {
      setTranslations(englishText);
      return;
    }

    const cachedTranslations = localStorage.getItem(`translations_${newLanguage}`);
    if (cachedTranslations) {
      setTranslations(JSON.parse(cachedTranslations));
      return;
    }

    setIsTranslating(true);
    try {
      const { translatedObject } = await translateObject({
        objectToTranslate: englishText,
        targetLanguage: newLanguage,
      });
      const newTranslations = translatedObject as Translations;
      localStorage.setItem(`translations_${newLanguage}`, JSON.stringify(newTranslations));
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to English
      setTranslations(englishText);
    } finally {
      setIsTranslating(false);
    }
  }, [language]);
  
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
        if(savedLanguage !== 'English') {
             setLanguage(savedLanguage).finally(() => setIsInitialized(true));
        } else {
             setLanguageState('English');
             setTranslations(englishText);
             setIsInitialized(true);
        }
    } else {
      setShowModal(true);
      // No setIsInitialized(true) here, it will be set after modal selection
    }
  }, [setLanguage]);

  const handleModalSubmit = async () => {
    setShowModal(false);
    await setLanguage(tempSelectedLanguage);
    setIsInitialized(true);
  };
  
  const renderModal = () => (
    <Dialog open={showModal}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} hideCloseButton={true}>
            <DialogHeader>
                <DialogTitle>{t('language_modal.title')}</DialogTitle>
                <DialogDescription>{t('language_modal.subtitle')}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Select value={tempSelectedLanguage} onValueChange={setTempSelectedLanguage}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button onClick={handleModalSubmit} disabled={isTranslating}>
                {isTranslating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('language_modal.continue')}
            </Button>
        </DialogContent>
    </Dialog>
  );

  if (!isInitialized) {
    return (
      <>
        {showModal ? renderModal() : (
            <div className="flex justify-center items-center h-screen w-screen bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )}
      </>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
