
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PalmUploadSchema, type PalmUploadFormValues } from '@/lib/schemas'; 
import { useState, type ChangeEvent, useEffect } from 'react';
import NextImage from 'next/image'; 
import { Hand } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PalmUploadFormProps {
  onSubmit: (values: PalmUploadFormValues) => void;
  isLoading: boolean;
}

// Helper function for sharpening
function applySharpen(imageData: ImageData, width: number, height: number): ImageData {
  const { data } = imageData;
  const outputData = new Uint8ClampedArray(data.length);

  // Sharpening kernel
  const kernel = [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
  ];
  const kernelSize = kernel.length;
  const halfKernelSize = Math.floor(kernelSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelY = y + (ky - halfKernelSize);
          const pixelX = x + (kx - halfKernelSize);

          if (pixelY >= 0 && pixelY < height && pixelX >= 0 && pixelX < width) {
            const offset = (pixelY * width + pixelX) * 4;
            const weight = kernel[ky][kx];
            r += data[offset] * weight;
            g += data[offset + 1] * weight;
            b += data[offset + 2] * weight;
          }
        }
      }

      const outputOffset = (y * width + x) * 4;
      outputData[outputOffset] = Math.max(0, Math.min(255, r));
      outputData[outputOffset + 1] = Math.max(0, Math.min(255, g));
      outputData[outputOffset + 2] = Math.max(0, Math.min(255, b));
      outputData[outputOffset + 3] = data[outputOffset + 3]; // Alpha channel
    }
  }
  return new ImageData(outputData, width, height);
}


export function PalmUploadForm({ onSubmit, isLoading }: PalmUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm<PalmUploadFormValues>({
    resolver: zodResolver(PalmUploadSchema),
    defaultValues: {
        palmImage: "",
    }
  });

  useEffect(() => {
    // Clean up object URLs when component unmounts or preview changes
    let currentPreview = preview;
    return () => {
      if (currentPreview && currentPreview.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [preview]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    
    if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview); // Revoke old object URL if exists
    }
    setPreview(null); // Reset preview
    fieldChange(''); // Reset form field

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const originalImageSrc = reader.result as string;

        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            toast({ title: "Image Processing Error", description: "Could not get canvas context. Using original image.", variant: "destructive" });
            // Fallback to original if canvas fails, though less ideal
            // Consider if direct originalImageSrc is acceptable by AI or schema
            setPreview(originalImageSrc); 
            fieldChange(originalImageSrc); 
            return;
          }

          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let { width, height } = img;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);

          try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const sharpenedData = applySharpen(imageData, width, height);
            ctx.putImageData(sharpenedData, 0, 0);
          } catch (e) {
            console.error("Error during image sharpening:", e);
            toast({ title: "Sharpening Failed", description: "Could not sharpen image, using resized version.", variant: "default" });
          }
          
          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.85); 

          setPreview(processedDataUrl);
          fieldChange(processedDataUrl);
        };
        img.onerror = () => {
          toast({ title: "Image Load Error", description: "Could not load the selected image file.", variant: "destructive" });
        };
        img.src = originalImageSrc;
      };
      reader.onerror = () => {
          toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
      }
      reader.readAsDataURL(file);
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
                  accept="image/jpeg,image/png,image/webp" 
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
            <NextImage src={preview} alt="Palm preview" width={200} height={200} className="rounded-md max-h-[300px] object-contain" data-ai-hint="hand palm" />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !preview || !form.formState.isValid} 
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
