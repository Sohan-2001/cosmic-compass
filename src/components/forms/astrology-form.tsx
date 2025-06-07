
'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon, WandSparkles } from 'lucide-react';
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
            const [dateInputValue, setDateInputValue] = useState<string>(
              field.value ? format(field.value, 'yyyy-MM-dd') : ''
            );
             const [isCalendarOpen, setIsCalendarOpen] = useState(false);

            useEffect(() => {
              // Sync from RHF (e.g., calendar pick or form reset) to local input string
              if (field.value) {
                if (format(field.value, 'yyyy-MM-dd') !== dateInputValue) {
                  setDateInputValue(format(field.value, 'yyyy-MM-dd'));
                }
              } else {
                 if (dateInputValue !== '') {
                    setDateInputValue('');
                 }
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value]);

            const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              setDateInputValue(e.target.value);
            };

            const handleInputBlur = () => {
              if (dateInputValue === '') {
                if (field.value !== undefined) field.onChange(undefined);
                return;
              }
              const yyyyMMddRegex = /^\d{4}-\d{2}-\d{2}$/;
              if (yyyyMMddRegex.test(dateInputValue)) {
                const parsedDate = parse(dateInputValue, 'yyyy-MM-dd', new Date());
                if (isValid(parsedDate) && format(parsedDate, 'yyyy-MM-dd') === dateInputValue) {
                  if (!field.value || format(parsedDate, 'yyyy-MM-dd') !== format(field.value, 'yyyy-MM-dd')) {
                    field.onChange(parsedDate);
                  }
                } else {
                  // Invalid date like 2023-02-30
                  if (field.value !== undefined) field.onChange(undefined);
                }
              } else {
                // Malformed input
                if (field.value !== undefined) field.onChange(undefined);
              }
            };
            
            const handleCalendarSelect = (selectedDate: Date | undefined) => {
              field.onChange(selectedDate);
              if (selectedDate) {
                setDateInputValue(format(selectedDate, 'yyyy-MM-dd'));
              } else {
                setDateInputValue('');
              }
              setIsCalendarOpen(false); // Close popover on select
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel className="font-headline text-lg">Date of Birth (YYYY-MM-DD)</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="YYYY-MM-DD"
                      value={dateInputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      className="flex-grow"
                    />
                  </FormControl>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button variant={'outline'} size="icon" className="shrink-0">
                        <CalendarIcon className="h-4 w-4" />
                        <span className="sr-only">Open calendar</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={handleCalendarSelect}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
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
              <FormLabel className="font-headline text-lg">Time of Birth (HH:MM)</FormLabel>
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
              <FormLabel className="font-headline text-lg">Place of Birth (City, Country)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., London, UK" {...field} className="w-full" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out">
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
