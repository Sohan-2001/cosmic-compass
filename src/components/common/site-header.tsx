
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/context/language-context';
import { languages } from '@/data/languages';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Hand, Home, Sparkles, User, Wand2, Star, LogIn, LogOut, Sun, Languages, Loader2, Menu, ChevronDown, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';


const MainNav = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const links = [
    { href: '/', label: t('sidebar.home'), icon: Home },
    { href: '/astrology', label: t('sidebar.ai_astrology'), icon: Sparkles },
    { href: '/palmistry', label: t('sidebar.ai_palmistry'), icon: Hand },
    { href: '/face-reading', label: t('sidebar.ai_face_reading'), icon: User },
    { href: '/zodiac-signs', label: t('sidebar.zodiac_signs'), icon: Sun },
    { href: '/chat', label: t('sidebar.ai_astrologer_chat'), icon: Bot },
  ];
  
  if (!isClient) {
    return (
        <nav className={cn('hidden md:flex items-center space-x-4 lg:space-x-6', className)} {...props}>
         {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className='text-sm font-medium text-muted-foreground animate-pulse bg-muted/50 h-6 w-20 rounded-md'
            />
          ))}
        </nav>
    );
  }

  const visibleLinks = isMobile ? links.slice(0, 1) : links.slice(0, 3);
  const hiddenLinks = isMobile ? links.slice(1) : links.slice(3);
  
  const renderLink = (link: { href: string; label: string }) => (
     <Link
        href={link.href}
        className={cn(
          'text-sm font-medium transition-colors hover:text-primary',
          pathname === link.href ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {link.label}
      </Link>
  );

  return (
    <nav className={cn('hidden md:flex items-center space-x-4 lg:space-x-6', className)} {...props}>
      {visibleLinks.map((link) => (
        <div key={link.href}>
            {renderLink(link)}
        </div>
      ))}
      {hiddenLinks.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="ghost" className="text-sm font-medium text-muted-foreground hover:text-primary p-0 h-auto">
                More
                <ChevronDown className="relative top-[1px] ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                 {hiddenLinks.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                       {renderLink(link)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
      )}
    </nav>
  );
};

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const links = [
    { href: '/', label: t('sidebar.home') },
    { href: '/astrology', label: t('sidebar.ai_astrology') },
    { href: '/palmistry', label: t('sidebar.ai_palmistry') },
    { href: '/face-reading', label: t('sidebar.ai_face_reading') },
    { href: '/zodiac-signs', label: t('sidebar.zodiac_signs') },
    { href: '/chat', label: t('sidebar.ai_astrologer_chat') },
  ];

  if (user) {
    links.push({ href: '/results', label: t('sidebar.results') });
  }

  return (
     <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="ml-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <SheetHeader>
             <SheetTitle className="sr-only">Menu</SheetTitle>
             <SheetDescription className="sr-only">Main navigation menu for Cosmic Compass, providing links to all pages.</SheetDescription>
          </SheetHeader>
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
            onClick={() => setOpen(false)}
          >
            <Wand2 className="h-6 w-6 text-accent" />
            <span className="font-bold">{t('sidebar.title')}</span>
          </Link>
          <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
            <div className="flex flex-col space-y-3">
              {links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'text-muted-foreground transition-colors hover:text-primary',
                       pathname === item.href && 'text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
              ))}
                <div className="pt-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button>
                        <Coffee className="mr-2" />
                        Buy me a coffee
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem asChild>
                        <a href="https://razorpay.me/@sarmasol" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          Custom
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href="https://rzp.io/l/OpSJEXF" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                          ₹51
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
               </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
  )
}

export function SiteHeader() {
  const { user, loading } = useAuth();
  const { t, language, setLanguage, isTranslating } = useTranslation();
  const pathname = usePathname();
  
  const handleSignOut = async () => {
    await auth.signOut();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MobileNav />
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-accent" />
            <span className="hidden font-bold sm:inline-block">{t('sidebar.title')}</span>
          </Link>
          <MainNav />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
             <div className="hidden md:flex items-center gap-2">
                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4 text-muted-foreground" />}
                <Select value={language} onValueChange={(value) => setLanguage(value)} disabled={isTranslating}>
                    <SelectTrigger className="w-[120px] h-9 border-0 bg-transparent shadow-none focus:ring-0 text-muted-foreground hover:text-primary">
                        <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button>
                    <Coffee className="mr-2" />
                    Buy me a coffee
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <a href="https://razorpay.me/@sarmasol" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      Custom
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://rzp.io/l/OpSJEXF" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      ₹51
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {!loading && user && (
               <Link
                href="/results"
                className={cn(
                    'hidden md:inline-flex text-sm font-medium transition-colors hover:text-primary',
                    pathname === '/results' ? 'text-primary' : 'text-muted-foreground',
                    'ml-4'
                )}
                >
                {t('sidebar.results')}
                </Link>
            )}
             {!loading && (
                user ? (
                    <Button variant="ghost" className="hidden md:inline-flex" onClick={handleSignOut}>
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>{t('sidebar.sign_out')}</span>
                    </Button>
                ) : (
                    <Button variant="ghost" className="hidden md:inline-flex" asChild>
                        <Link href="/login">
                            <LogIn className="h-4 w-4 mr-2" />
                            <span>{t('sidebar.sign_in')}</span>
                        </Link>
                    </Button>
                )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
