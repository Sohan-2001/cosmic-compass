
'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '@/context/language-context';

export function DevelopmentBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const bannerDismissed = localStorage.getItem('developmentBannerDismissed');
    if (!bannerDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('developmentBannerDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="container max-w-screen-2xl py-2">
        <Alert variant="default" className="relative bg-primary/10 border-primary/20 text-foreground">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertTitle className="font-bold text-primary">
            {t('banner.title')}
          </AlertTitle>
          <AlertDescription>
            <p>{t('banner.description_p1')}</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>{t('banner.description_li1')}</li>
                <li>{t('banner.description_li2')}</li>
            </ul>
          </AlertDescription>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </Alert>
    </div>
  );
}
