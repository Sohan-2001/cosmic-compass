
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Hand, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-12 px-4">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline text-accent mb-6">
            Welcome to Cosmic Compass
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 mb-6 max-w-3xl text-left">
            Navigate your life's journey with insights from the stars and the wisdom hidden in your hands. Cosmic Compass offers personalized astrological forecasts and detailed palm readings to illuminate your path.
          </p>
          <div className="space-y-1">
            <p className="text-md text-muted-foreground">
              Developed by <span className="font-semibold text-foreground/70">Sohan Karfa</span>
            </p>
            <p className="text-md text-muted-foreground font-semibold">
              Powered by Google AI
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-3xl md:text-4xl font-headline text-primary mb-10 text-center">
            Our Services
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/astrology" className="group">
              <Card className="h-full hover:shadow-xl hover:border-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-headline text-accent group-hover:text-primary transition-colors">
                    <Sparkles className="mr-3 h-7 w-7" />
                    Astrological Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70 mb-4">
                    Uncover monthly and yearly forecasts based on your birth details. Explore major transits, planetary influences, and potential life themes.
                  </CardDescription>
                  <div className="flex items-center text-sm font-medium text-accent group-hover:text-primary transition-colors">
                    Explore Astrology <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/palm-reading" className="group">
              <Card className="h-full hover:shadow-xl hover:border-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-headline text-accent group-hover:text-primary transition-colors">
                    <Hand className="mr-3 h-7 w-7" />
                    Palm Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70 mb-4">
                    Upload an image of your palm and receive a personalized reading. Discover key predictions and a detailed analysis based on traditional palmistry.
                  </CardDescription>
                   <div className="flex items-center text-sm font-medium text-accent group-hover:text-primary transition-colors">
                    Read Your Palm <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      </main>
      <footer className="text-center py-10 border-t border-border/50 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Cosmic Compass. All rights reserved.</p>
        <p className="font-headline mt-1">Let the stars guide your way.</p>
      </footer>
    </div>
  );
}
