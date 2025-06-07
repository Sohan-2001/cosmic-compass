
'use client';
import type { Control } from 'react-hook-form'; // Control is not strictly needed if form.control is used directly
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
      birthDate: undefined, // Explicitly set undefined for initial state
      birthTime: '',
      birthLocation: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control} // Removed unnecessary 'as unknown as Control<AstrologyFormValues>'
          name="birthDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="font-headline text-lg">Date of Birth (YYYY-MM-DD)</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const dateString = e.target.value;
                      if (dateString === '') {
                        field.onChange(undefined);
                        return;
                      }
                      
                      const yyyyMMddRegex = /^\d{4}-\d{2}-\d{2}$/;
                      if (yyyyMMddRegex.test(dateString)) {
                        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
                        if (isValid(parsedDate) && format(parsedDate, 'yyyy-MM-dd') === dateString) {
                          field.onChange(parsedDate);
                        } else {
                          field.onChange(undefined); // Invalid date like 2023-02-30
                        }
                      } else {
                        // Not in YYYY-MM-DD format or incomplete
                        field.onChange(undefined); 
                      }
                    }}
                    className={cn(
                      'flex-grow',
                      !field.value && dateInputIsEmpty(form.getValues('birthDate'), field.value) && 'text-muted-foreground'
                    )}
                  />
                </FormControl>
                <Popover>
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
                      onSelect={(date) => {
                        field.onChange(date);
                      }}
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
          )}
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

// Helper function to determine if the input should show placeholder text
// This is a bit of a workaround because `field.value` might be undefined
// but the actual input element's value (controlled by react-hook-form) might not be empty string yet.
// For our simplified direct control, if field.value is undefined, input value is ''.
function dateInputIsEmpty(formValue: Date | undefined, fieldValue: Date | undefined): boolean {
  return !fieldValue;
}
