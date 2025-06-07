import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="py-6 px-4 md:px-8 border-b border-border/50 shadow-md">
      <div className="container mx-auto flex items-center gap-3">
        <Compass className="h-8 w-8 text-accent" />
        <h1 className="text-3xl md:text-4xl font-headline text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary-foreground">
          Cosmic Compass
        </h1>
      </div>
    </header>
  );
}
