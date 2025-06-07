
import { Header } from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AstrologySection } from '@/components/features/astrology-section';
import { PalmReadingSection } from '@/components/features/palm-reading-section';
import { Sparkles, Hand } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-8 px-4">
        <Tabs defaultValue="astrology" className="w-full max-w-2xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 bg-primary/20 p-2 rounded-lg mb-6 relative z-40">
            <TabsTrigger 
              value="astrology" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg py-3 text-sm md:text-base font-headline transition-all duration-300 ease-in-out"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Astrological Insights
            </TabsTrigger>
            <TabsTrigger 
              value="palm-reading" 
              className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-lg py-3 text-sm md:text-base font-headline transition-all duration-300 ease-in-out"
            >
              <Hand className="mr-2 h-5 w-5" />
              Palm Reading
            </TabsTrigger>
          </TabsList>
          <TabsContent value="astrology" className="p-1">
            <AstrologySection />
          </TabsContent>
          <TabsContent value="palm-reading" className="p-1">
            <PalmReadingSection />
          </TabsContent>
        </Tabs>
      </main>
      <footer className="text-center py-8 border-t border-border/50 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cosmic Compass. All rights reserved.</p>
        <p className="font-headline mt-1">Let the stars guide your way.</p>
      </footer>
    </div>
  );
}
