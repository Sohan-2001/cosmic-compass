
'use client';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Bot, Hand, Home, Sparkles, User, Wand2, Star, LogIn, LogOut, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';
import { useTranslation } from '@/context/language-context';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await auth.signOut();
  };
  
  const links = [
    { href: '/', label: t('sidebar.home'), icon: Home },
    { href: '/astrology', label: t('sidebar.ai_astrology'), icon: Sparkles },
    { href: '/palmistry', label: t('sidebar.ai_palmistry'), icon: Hand },
    { href: '/face-reading', label: t('sidebar.ai_face_reading'), icon: User },
    { href: '/zodiac-signs', label: t('sidebar.zodiac_signs'), icon: Sun },
    { href: '/chat', label: t('sidebar.ai_astrologer_chat'), icon: Bot },
  ];

  const authenticatedLinks = [
      { href: '/results', label: t('sidebar.results'), icon: Star },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" asChild>
                <Link href="/" aria-label="Home">
                    <Wand2 className="h-6 w-6 text-accent" />
                </Link>
            </Button>
            <div className="flex flex-col">
                 <h2 className="text-lg font-semibold font-headline tracking-tighter">{t('sidebar.title')}</h2>
                 <p className="text-xs text-muted-foreground -mt-1">{t('sidebar.subtitle')}</p>
            </div>
        </div>
      </SidebarHeader>
      <SidebarMenu>
        {links.map((link) => (
          <SidebarMenuItem key={link.href}>
            <Button
              variant={pathname === link.href ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href={link.href}>
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        ))}
        {user && authenticatedLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
                <Button
                variant={pathname === link.href ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                asChild
                >
                <Link href={link.href}>
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                </Link>
                </Button>
            </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <SidebarFooter className="mt-auto">
        {!loading && (
            user ? (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span>{t('sidebar.sign_out')}</span>
                </Button>
            ) : (
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                    <Link href="/login">
                        <LogIn className="h-4 w-4" />
                        <span>{t('sidebar.sign_in')}</span>
                    </Link>
                </Button>
            )
        )}
        <p className="text-xs text-muted-foreground text-center mt-4">
            {t('sidebar.copyright', { year: new Date().getFullYear() })}
        </p>
      </SidebarFooter>
    </>
  );
}
