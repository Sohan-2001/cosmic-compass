
'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
// Removed Calendar and Popover imports
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import { WandSparkles } from 'lucide-react'; // Removed CalendarIcon
import { AstrologyFormSchema, type AstrologyFormValues } from '@/lib/schemas';

interface AstrologyFormProps {
  onSubmit: (values: AstrologyFormValues) => void;
  isLoading: boolean;
}

export function AstrologyForm({ onSubmit, isLoading }: AstrologyFormProps) {
  const form = useForm<AstrologyFormValues>({
    resolver: zodResolver(AstrologyFormSchema),
    defaultValues: {
      birthDate: undefined,
      birthTime: '',
      birthLocation: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="birthDate"
          render={({ field }) => {
            // Local state for the input string value
            const [dateInputValue, setDateInputValue] = useState<string>('');

            useEffect(() => {
              // Sync from RHF's field.value (Date object) to local dateInputValue (string)
              // This is mainly for initial values or programmatic changes to RHF state.
              if (field.value instanceof Date && isValid(field.value)) {
                const formattedDateFromRHF = format(field.value, 'dd-MM-yyyy');
                if (dateInputValue !== formattedDateFromRHF) {
                  setDateInputValue(formattedDateFromRHF);
                }
              } else if (!field.value && dateInputValue) {
                // If RHF date is cleared (e.g. invalid on blur, form reset),
                // and input has text that was a valid date, clear input text.
                const parsedInput = parse(dateInputValue, 'dd-MM-yyyy', new Date());
                if (isValid(parsedInput) && format(parsedInput, 'dd-MM-yyyy') === dateInputValue) {
                  setDateInputValue('');
                }
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value]);


            const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let rawValue = e.target.value;
              const digitsOnly = rawValue.replace(/[^0-9]/g, '');
              
              let formattedValue = "";

              if (digitsOnly.length > 0) {
                formattedValue = digitsOnly.substring(0, Math.min(2, digitsOnly.length));
              }
              if (digitsOnly.length > 2) {
                formattedValue += "-" + digitsOnly.substring(2, Math.min(4, digitsOnly.length));
              }
              if (digitsOnly.length > 4) {
                formattedValue += "-" + digitsOnly.substring(4, Math.min(8, digitsOnly.length)); // DDMMYYYY (8 digits)
              }
              
              setDateInputValue(formattedValue);
            };

            const handleInputBlur = () => {
              if (dateInputValue === '') {
                if (field.value !== undefined) field.onChange(undefined);
                return;
              }
              const ddMMyyyyRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
              if (ddMMyyyyRegex.test(dateInputValue)) {
                const parsedDate = parse(dateInputValue, 'dd-MM-yyyy', new Date());
                if (isValid(parsedDate) && format(parsedDate, 'dd-MM-yyyy') === dateInputValue) {
                  if (!field.value || format(parsedDate, 'yyyy-MM-dd') !== format(field.value, 'yyyy-MM-dd')) {
                    field.onChange(parsedDate);
                  }
                } else {
                  if (field.value !== undefined) field.onChange(undefined);
                }
              } else {
                if (field.value !== undefined) field.onChange(undefined);
              }
            };
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel className="font-headline text-sm md:text-base">Date of Birth (DD-MM-YYYY)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="DD-MM-YYYY"
                    value={dateInputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-full"
                    maxLength={10} // DD-MM-YYYY is 10 chars
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="birthTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline text-sm md:text-base">Time of Birth (HH:MM)</FormLabel>
              <FormControl>
                <Input type="time" {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="birthLocation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline text-sm md:text-base">Place of Birth (City, Country)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., London, UK" {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-sm md:text-base py-3 md:py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <WandSparkles className="mr-2 h-5 w-5 animate-pulse" />
              Consulting the Cosmos...
            </>
          ) : (
            <>
              <WandSparkles className="mr-2 h-5 w-5" />
              Reveal My Cosmic Path
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
