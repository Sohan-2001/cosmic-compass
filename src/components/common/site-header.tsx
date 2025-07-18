import { SidebarTrigger } from '@/components/ui/sidebar';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-sm border-b md:hidden">
      <div className="container flex h-14 items-center">
        <div className="flex items-center space-x-2">
          <SidebarTrigger />
          <h1 className="font-headline text-2xl font-bold text-primary">Astro AI</h1>
        </div>
      </div>
    </header>
  );
}
