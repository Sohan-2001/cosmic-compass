import { cn } from "@/lib/utils";

type ZodiacIconProps = {
  sign: string;
  className?: string;
};

export const ZodiacIcon = ({ sign, className }: ZodiacIconProps) => {
  const icons: { [key: string]: React.ReactNode } = {
    Aries: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 80 C40 40, 60 40, 80 80 M50 50 V20" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ),
    Taurus: (
      <svg viewBox="0 0 100 100" className={cn(className)}><circle cx="50" cy="65" r="25" fill="none" stroke="currentColor" strokeWidth="8" /><path d="M30 40 C40 20, 60 20, 70 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Gemini: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M25 20 V80 M75 20 V80 M20 25 H80 M20 75 H80" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Cancer: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M30 30 a 20 20 0 1 0 40 0 M70 70 a 20 20 0 1 1 -40 0" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Leo: (
      <svg viewBox="0 0 100 100" className={cn(className)}><circle cx="40" cy="40" r="20" fill="none" stroke="currentColor" strokeWidth="8"/><path d="M60 40 C 80 20, 90 50, 60 80" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Virgo: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 20 V80 M40 20 V80 M60 20 V80 M80 20 V80 C60 60, 90 90, 80 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    Libra: (
       <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 75 H80 M20 60 H80 M30 60 C50 40, 50 40, 70 60" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Scorpio: (
       <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 20 V80 M40 20 V80 M60 20 V80 L85 55" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
    Sagittarius: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 80 L80 20 M50 20 H80 V50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    Capricorn: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 40 V80 M40 20 V80 C 80 80, 80 40, 40 40" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    Aquarius: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M20 40 L40 60 L60 40 L80 60 M20 65 L40 85 L60 65 L80 85" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ),
    Pisces: (
      <svg viewBox="0 0 100 100" className={cn(className)}><path d="M25 20 C5 40, 5 60, 25 80 M75 20 C95 40, 95 60, 75 80 M25 50 H75" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" /></svg>
    ),
  };

  return icons[sign] || null;
};
