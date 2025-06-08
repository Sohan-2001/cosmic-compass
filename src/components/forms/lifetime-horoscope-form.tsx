
'use client';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format, parse, isValid as isValidDate } from 'date-fns';
import { Route } from 'lucide-react'; // Or another suitable icon
import { LifetimeHoroscopeFormSchema, type LifetimeHoroscopeFormValues } from '@/lib/schemas';

interface LifetimeHoroscopeFormProps {
  onSubmit: (values: LifetimeHoroscopeFormValues) => void;
  isLoading: boolean;
}

export function LifetimeHoroscopeForm({ onSubmit, isLoading }: LifetimeHoroscopeFormProps) {
  const form = useForm<LifetimeHoroscopeFormValues>({
    resolver: zodResolver(LifetimeHoroscopeFormSchema),
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
            const [dateInputValue, setDateInputValue] = useState<string>('');

            useEffect(() => {
              if (field.value instanceof Date && isValidDate(field.value)) {
                const formattedDateFromRHF = format(field.value, 'dd-MM-yyyy');
                if (dateInputValue !== formattedDateFromRHF) {
                  setDateInputValue(formattedDateFromRHF);
                }
              } else if (!field.value && dateInputValue) {
                 setDateInputValue(''); 
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
              const ddMMyyyyRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\\d{4}$/;
              if (ddMMyyyyRegex.test(dateInputValue)) {
                const parsedDate = parse(dateInputValue, 'dd-MM-yyyy', new Date());
                if (isValidDate(parsedDate) && format(parsedDate, 'dd-MM-yyyy') === dateInputValue) {
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
                    maxLength={10}
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
            const [localDisplayTime, setLocalDisplayTime] = useState<string>(''); 
            const [localIsPM, setLocalIsPM] = useState<boolean>(false);

            useEffect(() => {
              const twentyFourHourTime = field.value; 
              if (twentyFourHourTime && /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/.test(twentyFourHourTime)) {
                const [h24, m24] = twentyFourHourTime.split(':').map(Number);
                const newIsPM = h24 >= 12;
                let h12 = h24 % 12;
                if (h12 === 0) h12 = 12; 

                const newDisplayTime = `${String(h12).padStart(2, '0')}:${String(m24).padStart(2, '0')}`;
                if (newDisplayTime !== localDisplayTime) setLocalDisplayTime(newDisplayTime);
                if (newIsPM !== localIsPM) setLocalIsPM(newIsPM);
              } else if (twentyFourHourTime === '' && (localDisplayTime !== '' || localIsPM !== false)) {
                setLocalDisplayTime('');
                setLocalIsPM(false);
              }
            // eslint-disable-next-line react-hooks/exhaustive-deps
            }, [field.value]); 

            const updateRHFTime = (timeStr: string, isPmVal: boolean) => {
              if (!timeStr) {
                if(field.value !== '') field.onChange('');
                return;
              }
              const timeParts = timeStr.split(':');
              if (timeParts.length !== 2) {
                if(field.value !== '') field.onChange(''); return;
              }
              
              let hour12 = parseInt(timeParts[0], 10);
              const minute = parseInt(timeParts[1], 10);

              if (isNaN(hour12) || isNaN(minute) || hour12 < 1 || hour12 > 12 || minute < 0 || minute > 59) {
                if(field.value !== '') field.onChange(''); 
                return;
              }

              let hour24 = hour12;
              if (isPmVal && hour12 !== 12) { 
                hour24 += 12;
              } else if (!isPmVal && hour12 === 12) { 
                hour24 = 0;
              }

              const formatted24HourTime = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
              if(field.value !== formatted24HourTime) field.onChange(formatted24HourTime);
            };

            const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              let value = e.target.value;
              const digitsAndColon = value.replace(/[^0-9:]/g, '');
              let [hoursStr = '', minutesStr = ''] = digitsAndColon.split(':');

              hoursStr = hoursStr.slice(0, 2);
              minutesStr = minutesStr.slice(0, 2);
              
              let formattedTime = hoursStr;
              if (digitsAndColon.includes(':') || (hoursStr.length === 2 && value.length > 2 && e.nativeEvent.inputType !== 'deleteContentBackward')) {
                 formattedTime += ':' + minutesStr;
              } else if (hoursStr.length === 2 && value.length === 2 && e.nativeEvent.inputType !== 'deleteContentBackward'){
                 formattedTime += ':'; 
              }
              
              setLocalDisplayTime(formattedTime.slice(0,5)); 
            };
            
            const handleTimeInputBlur = () => {
                const parts = localDisplayTime.split(':');
                if (parts.length === 2) {
                    const h = String(parts[0]).padStart(2, '0');
                    const m = String(parts[1]).padStart(2, '0');
                    const properlyFormattedTime = `${h}:${m}`;
                    if (localDisplayTime !== properlyFormattedTime) {
                         setLocalDisplayTime(properlyFormattedTime); 
                    }
                    updateRHFTime(properlyFormattedTime, localIsPM); 
                } else if (localDisplayTime === '') {
                     updateRHFTime('', localIsPM);
                } else {
                    updateRHFTime(localDisplayTime, localIsPM); 
                }
            };

            const handleAmPmChange = (checked: boolean) => {
              setLocalIsPM(checked);
              updateRHFTime(localDisplayTime, checked);
            };

            return (
              <FormItem>
                <FormLabel className="font-headline text-sm md:text-base">Time of Birth (HH:MM)</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input
                      type="text" 
                      placeholder="HH:MM (e.g. 09:30)"
                      value={localDisplayTime}
                      onChange={handleTimeInputChange}
                      onBlur={handleTimeInputBlur} 
                      className="w-full md:w-auto" 
                      maxLength={5} 
                    />
                  </FormControl>
                  <div className="flex items-center space-x-2 p-2 rounded-md border border-input">
                    <Switch
                      id="ampm-switch-lifetime"
                      checked={localIsPM}
                      onCheckedChange={handleAmPmChange}
                      aria-label={localIsPM ? 'PM' : 'AM'}
                    />
                    <Label htmlFor="ampm-switch-lifetime" className="text-sm font-medium">
                      {localIsPM ? 'PM' : 'AM'}
                    </Label>
                  </div>
                </div>
                <FormMessage /> 
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
              <Route className="mr-2 h-5 w-5 animate-pulse" />
              Mapping Your Lifespan...
            </>
          ) : (
            <>
              <Route className="mr-2 h-5 w-5" />
              Chart My Lifetime Path
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
