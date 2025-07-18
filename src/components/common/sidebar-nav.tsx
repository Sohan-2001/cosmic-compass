'use client';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Bot, Hand, Home, Sparkles, User, Wand2, Star, LogIn, LogOut, Sun } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '../ui/button';
import { useAuth } from '@/context/auth-context';
import { auth } from '@/lib/firebase';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/astrology', label: 'AI Astrology', icon: Sparkles },
  { href: '/palmistry', label: 'AI Palmistry', icon: Hand },
  { href: '/face-reading', label: 'AI Face Reading', icon: User },
  { href: '/zodiac-signs', label: 'Zodiac Signs', icon: Sun },
  { href: '/chat', label: 'AI Astrologer Chat', icon: Bot },
];

const authenticatedLinks = [
    { href: '/results', label: 'Results', icon: Star },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
  };

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
                 <h2 className="text-lg font-semibold font-headline tracking-tighter">Astro AI</h2>
                 <p className="text-xs text-muted-foreground -mt-1">Cosmic Insights</p>
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
                    <span>Sign Out</span>
                </Button>
            ) : (
                <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                    <Link href="/login">
                        <LogIn className="h-4 w-4" />
                        <span>Sign In</span>
                    </Link>
                </Button>
            )
        )}
        <p className="text-xs text-muted-foreground text-center mt-4">
            &copy; {new Date().getFullYear()} Astro AI
        </p>
      </SidebarFooter>
    </>
  );
}
