
'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label'; // Added missing import
import { cn } from '@/lib/utils';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { WandSparkles } from 'lucide-react';
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
      birthTime: '', // Stays as 24h format for RHF
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
            const [dateInputValue, setDateInputValue] = useState<string>('');

            useEffect(() => {
              if (field.value instanceof Date && isValidDate(field.value)) {
                const formattedDateFromRHF = format(field.value, 'dd-MM-yyyy');
                if (dateInputValue !== formattedDateFromRHF) {
                  setDateInputValue(formattedDateFromRHF);
                }
              } else if (!field.value && dateInputValue) {
                // If RHF value is cleared but input has text, check if text is a valid parseable date
                // This handles cases where RHF might be cleared due to external validation/reset
                // and we want the input to clear too if it's not a valid date itself.
                const parsedInput = parse(dateInputValue, 'dd-MM-yyyy', new Date());
                if (isValidDate(parsedInput) && format(parsedInput, 'dd-MM-yyyy') === dateInputValue) {
                  // It was a valid date, but RHF is now empty, so maybe clear input too or let user edit
                  // For now, let's clear it if RHF is explicitly undefined/null
                } else {
                  // dateInputValue is not a valid date according to RHF's clear action
                }
                 setDateInputValue(''); // Default to clearing if RHF is cleared and input has text
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
                formattedValue += "-" + digitsOnly.substring(4, Math.min(8, digitsOnly.length));
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
                if (isValidDate(parsedDate) && format(parsedDate, 'dd-MM-yyyy') === dateInputValue) {
                  // Ensure we are not causing a loop by checking if date has actually changed
                  if (!field.value || format(parsedDate, 'yyyy-MM-dd') !== format(field.value, 'yyyy-MM-dd')) {
                    field.onChange(parsedDate);
                  }
                } else {
                  // Invalid date according to date-fns (e.g., 31-02-2023)
                  if (field.value !== undefined) field.onChange(undefined); // Clear RHF if invalid
                }
              } else {
                // Regex failed (format is wrong)
                if (field.value !== undefined) field.onChange(undefined); // Clear RHF if format is wrong
              }
            };
            
            return (
              <FormItem className="flex flex-col">
                <FormLabel className="font-headline text-sm md:text-base">Date of Birth (DD-MM-YYYY)</FormLabel>
                <FormControl>
                  <Input
                    type="text" // Changed from date to text to allow custom formatting/parsing
                    placeholder="DD-MM-YYYY"
                    value={dateInputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur} // process date on blur
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
          render={({ field }) => {
            // Local state for 12-hour format time input and AM/PM switch
            const [localDisplayTime, setLocalDisplayTime] = useState<string>(''); // HH:MM (12h)
            const [localIsPM, setLocalIsPM] = useState<boolean>(false);

            // Effect to sync from RHF (24h) to local (12h + AM/PM) when field.value changes
            useEffect(() => {
              const twentyFourHourTime = field.value; // This is from RHF, e.g., "14:30"
              if (twentyFourHourTime && /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/.test(twentyFourHourTime)) {
                const [h24, m24] = twentyFourHourTime.split(':').map(Number);
                const newIsPM = h24 >= 12;
                let h12 = h24 % 12;
                if (h12 === 0) h12 = 12; // 00:xx -> 12 AM, 12:xx -> 12 PM

                const newDisplayTime = `${String(h12).padStart(2, '0')}:${String(m24).padStart(2, '0')}`;
                // Only update local state if it's different to prevent loops
                if (newDisplayTime !== localDisplayTime) setLocalDisplayTime(newDisplayTime);
                if (newIsPM !== localIsPM) setLocalIsPM(newIsPM);
              } else if (twentyFourHourTime === '' && (localDisplayTime !== '' || localIsPM !== false)) {
                // If RHF time is cleared, clear local state too
                setLocalDisplayTime('');
                setLocalIsPM(false);
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value]); // Trigger only when RHF value changes

            // Function to update RHF (24h) based on local 12h time and AM/PM
            const updateRHFTime = (timeStr: string, isPmVal: boolean) => {
              if (!timeStr) {
                if(field.value !== '') field.onChange(''); // Update RHF only if it's not already empty
                return;
              }
              const timeParts = timeStr.split(':');
              if (timeParts.length !== 2) {
                if(field.value !== '') field.onChange(''); return;
              }
              
              let hour12 = parseInt(timeParts[0], 10);
              const minute = parseInt(timeParts[1], 10);

              if (isNaN(hour12) || isNaN(minute) || hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) {
                if(field.value !== '') field.onChange(''); // Invalid 12h time format
                return;
              }

              let hour24 = hour12;
              if (isPmVal && hour12 !== 12) { // PM and not 12 PM
                hour24 += 12;
              } else if (!isPmVal && hour12 === 12) { // AM and 12 AM (midnight)
                hour24 = 0;
              }
              // For 12 PM, hour12 is 12, isPmVal is true, hour24 remains 12
              // For 1 AM to 11 AM, hour12 is 1-11, isPmVal is false, hour24 remains 1-11

              const formatted24HourTime = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
              if(field.value !== formatted24HourTime) field.onChange(formatted24HourTime); // Update RHF
            };

            const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;
              // Allow only digits and one colon
              const digitsAndColon = value.replace(/[^0-9:]/g, '');
              let [hoursStr = '', minutesStr = ''] = digitsAndColon.split(':');

              // Limit length of hours and minutes
              hoursStr = hoursStr.slice(0, 2);
              minutesStr = minutesStr.slice(0, 2);
              
              let formattedTime = hoursStr;
              // Auto-add colon if two digits entered for hours and not deleting, or if colon already typed
              if (digitsAndColon.includes(':') || (hoursStr.length === 2 && value.length > 2 && e.nativeEvent.inputType !== 'deleteContentBackward')) {
                 formattedTime += ':' + minutesStr;
              } else if (hoursStr.length === 2 && value.length === 2 && e.nativeEvent.inputType !== 'deleteContentBackward'){
                 formattedTime += ':'; // Auto-add colon
              }
              
              setLocalDisplayTime(formattedTime.slice(0,5)); // "HH:MM" is 5 chars
            };
            
            const handleTimeInputBlur = () => {
                // On blur, ensure HH:MM format with leading zeros if necessary
                const parts = localDisplayTime.split(':');
                if (parts.length === 2) {
                    const h = String(parts[0]).padStart(2, '0');
                    const m = String(parts[1]).padStart(2, '0');
                    const properlyFormattedTime = `${h}:${m}`;
                    if (localDisplayTime !== properlyFormattedTime) {
                         setLocalDisplayTime(properlyFormattedTime); // Update display
                    }
                    updateRHFTime(properlyFormattedTime, localIsPM); // Then update RHF
                } else if (localDisplayTime === '') {
                     updateRHFTime('', localIsPM); // Clear RHF if input is empty
                } else {
                    // If partially filled or incorrectly formatted, attempt to parse or clear
                    // For simplicity, we'll rely on the RHF validation to catch if it's not converted
                    updateRHFTime(localDisplayTime, localIsPM); // This will likely clear if invalid
                }
            };

            const handleAmPmChange = (checked: boolean) => {
              setLocalIsPM(checked);
              // Update RHF time when AM/PM changes, using current display time
              updateRHFTime(localDisplayTime, checked);
            };

            return (
              <FormItem>
                <FormLabel className="font-headline text-sm md:text-base">Time of Birth (HH:MM)</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="text" // Manual text input
                      placeholder="HH:MM (e.g. 09:30)"
                      value={localDisplayTime}
                      onChange={handleTimeInputChange}
                      onBlur={handleTimeInputBlur} // Validate and update RHF on blur
                      className="w-full md:w-auto" // Adjust width as needed
                      maxLength={5} // HH:MM
                    />
                  </FormControl>
                  <div className="flex items-center space-x-2 p-2 rounded-md border border-input">
                    <Switch
                      id="ampm-switch"
                      checked={localIsPM}
                      onCheckedChange={handleAmPmChange}
                      aria-label={localIsPM ? 'PM' : 'AM'}
                    />
                    <Label htmlFor="ampm-switch" className="text-sm font-medium">
                      {localIsPM ? 'PM' : 'AM'}
                    </Label>
                  </div>
                </div>
                <FormMessage /> {/* This will show RHF errors for the birthTime field */}
              </FormItem>
            );
          }}
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
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-base md:text-lg py-3 md:py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out"
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

    
    