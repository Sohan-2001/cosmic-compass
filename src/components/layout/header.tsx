
import { Compass } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50 shadow-md">
      <div className="container mx-auto">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <Compass className="h-8 w-8 text-accent" />
          <h1 className="text-3xl md:text-4xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary-foreground">
            Cosmic Compass
          </h1>
        </Link>
      </div>
    </header>
  );
}
