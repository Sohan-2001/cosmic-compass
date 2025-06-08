
'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Hand, ArrowRight, Route, Bot, Smile } from 'lucide-react'; // Added Bot, Smile
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [isPremiumAlertOpen, setIsPremiumAlertOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto py-12 px-4">
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-headline text-accent mb-6">
            Welcome to Cosmic Compass
          </h2>
          <p className="text-lg md:text-xl text-foreground/80 mb-6 max-w-3xl mx-auto">
            Navigate your life's journey with insights from the stars and the wisdom hidden in your hands and face. Cosmic Compass offers personalized astrological forecasts, detailed palm readings, and insightful face readings to illuminate your path.
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
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto"> {/* Adjusted xl:grid-cols-3 for 5 items */}
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

            <Link href="/face-reading" className="group">
              <Card className="h-full hover:shadow-xl hover:border-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-headline text-accent group-hover:text-primary transition-colors">
                    <Smile className="mr-3 h-7 w-7" />
                    Face Reading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70 mb-4">
                    Discover insights from your facial features. Upload your photo for an AI-powered analysis of personality traits and potential life aspects.
                  </CardDescription>
                   <div className="flex items-center text-sm font-medium text-accent group-hover:text-primary transition-colors">
                    Analyze My Face <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/lifetime-horoscope" className="group">
              <Card className="h-full hover:shadow-xl hover:border-accent/50 transition-all duration-300 ease-in-out transform hover:scale-105 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl font-headline text-accent group-hover:text-primary transition-colors">
                    <Route className="mr-3 h-7 w-7" />
                    Lifetime Horoscope
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70 mb-4">
                    Chart a course through your entire life. Get concise year-by-year astrological overviews based on your birth details.
                  </CardDescription>
                   <div className="flex items-center text-sm font-medium text-accent group-hover:text-primary transition-colors">
                    Map Your Journey <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <AlertDialog open={isPremiumAlertOpen} onOpenChange={setIsPremiumAlertOpen}>
              <AlertDialogTrigger asChild>
                <div className="group cursor-pointer">
                  <Card className="h-full hover:shadow-2xl border-yellow-500 hover:border-yellow-400 transition-all duration-300 ease-in-out transform hover:scale-105 bg-card/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center text-2xl font-headline text-yellow-500 group-hover:text-yellow-400 transition-colors">
                        <Bot className="mr-3 h-7 w-7" />
                        Astro Chat (Premium)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-foreground/70 mb-4">
                        Engage in interactive conversations with our AI astrologer. Ask questions, get clarifications, and explore your cosmic path in real-time.
                      </CardDescription>
                      <div className="flex items-center text-sm font-medium text-yellow-500 group-hover:text-yellow-400 transition-colors">
                        Learn More <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <Bot className="mr-2 h-5 w-5 text-yellow-500" />
                    Astro Chat - Premium Feature
                  </AlertDialogTitle>
                  <AlertDialogDescription className="pt-2 text-left">
                    The interactive Astro Chat is a premium feature offering direct conversations with our AI Astrologer.
                    <br /><br />
                    To learn more about enabling this feature or for other inquiries, please contact the admin:
                    <br />
                    <strong className="text-accent">sohan100karfa@gmail.com</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction onClick={() => setIsPremiumAlertOpen(false)} asChild>
                    <Button>Close</Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

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
