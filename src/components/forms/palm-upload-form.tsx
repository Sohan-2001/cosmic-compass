
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PalmUploadSchema, type PalmUploadFormValues } from '@/lib/schemas'; 
import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Hand } from 'lucide-react';

interface PalmUploadFormProps {
  onSubmit: (values: PalmUploadFormValues) => void;
  isLoading: boolean;
}

export function PalmUploadForm({ onSubmit, isLoading }: PalmUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const form = useForm<PalmUploadFormValues>({
    resolver: zodResolver(PalmUploadSchema),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        fieldChange(result); 
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      fieldChange('');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="palmImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline text-base md:text-lg">Upload Your Palm Image</FormLabel>
              <FormControl>
                 <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, field.onChange)} 
                  className="w-full h-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {preview && (
          <div className="mt-4 border border-dashed border-accent p-4 rounded-lg flex justify-center items-center">
            <Image src={preview} alt="Palm preview" width={200} height={200} className="rounded-md max-h-[300px] object-contain" data-ai-hint="hand palm" />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !preview} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-base md:text-lg py-3 md:py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <Hand className="mr-2 h-5 w-5 animate-pulse" />
              Reading Your Lifelines...
            </>
          ) : (
            <>
              <Hand className="mr-2 h-5 w-5" />
              Unveil My Destiny
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
