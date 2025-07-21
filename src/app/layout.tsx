import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { SiteHeader } from '@/components/common/site-header';
import { Toaster } from '@/components/ui/toaster';
import { BackgroundStars } from '@/components/common/background-stars';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Astro AI',
  description: 'AI Powered Astrology, Palmistry, and Face Reading',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased relative')}>
        <AuthProvider>
          <LanguageProvider>
            <BackgroundStars />
            <div className="flex flex-col min-h-screen">
              <SiteHeader />
              <main className="flex-1 p-4 md:p-8 z-10">
                {children}
              </main>
            </div>
            <Toaster />
          </LanguageProvider>
        </AuthProvider>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          async
          defer
        />
      </body>
    </html>
  );
}
