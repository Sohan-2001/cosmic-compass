'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { horoscopes } from '@/data/horoscopes';
import { ZodiacIcon } from '@/components/common/zodiac-icons';

export default function Home() {
  return (
    <div className="w-full">
      <section className="text-center mb-16">
        <h1 className="font-headline text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-primary to-accent mb-4">
          Astro AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the secrets of the cosmos. Explore your destiny with AI-powered astrology, palmistry, and face reading.
        </p>
      </section>

      <section>
        <h2 className="font-headline text-4xl text-center mb-8">Daily Horoscopes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {horoscopes.map((horoscope) => (
            <Card key={horoscope.sign} className="bg-card/50 backdrop-blur-sm border-border/20 hover:border-accent/50 transition-colors duration-300">
              <CardHeader className="flex flex-row items-center gap-4">
                <ZodiacIcon sign={horoscope.sign} className="w-10 h-10 text-accent" />
                <div>
                  <CardTitle className="font-headline text-2xl">{horoscope.sign}</CardTitle>
                  <p className="text-sm text-muted-foreground">{horoscope.dateRange}</p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80">{horoscope.reading}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
