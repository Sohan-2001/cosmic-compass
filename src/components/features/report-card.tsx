
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ReportCardProps {
  title: string;
  icon?: ReactNode;
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

export function ReportCard({ title, icon, isLoading = false, children, className }: ReportCardProps) {
  return (
    <Card className={`shadow-lg backdrop-blur-sm bg-card/80 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg md:text-xl font-headline text-accent">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm md:text-base leading-relaxed font-body">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
