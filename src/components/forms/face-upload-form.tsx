
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { FaceUploadSchema, type FaceUploadFormValues } from '@/lib/schemas'; 
import { useState, type ChangeEvent } from 'react';
import NextImage from 'next/image';
import { Smile } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FaceUploadFormProps {
  onSubmit: (values: FaceUploadFormValues) => void;
  isLoading: boolean;
}

// Helper function for sharpening (can be adjusted or removed if not desired for faces)
function applySharpen(imageData: ImageData, width: number, height: number): ImageData {
  const { data } = imageData;
  const outputData = new Uint8ClampedArray(data.length);

  const kernel = [
    [0, -0.5, 0],
    [-0.5, 3, -0.5], // Less aggressive sharpening than for palm lines
    [0, -0.5, 0]
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
      outputData[outputOffset + 3] = data[outputOffset + 3]; 
    }
  }
  return new ImageData(outputData, width, height);
}


export function FaceUploadForm({ onSubmit, isLoading }: FaceUploadFormProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();
  const form = useForm<FaceUploadFormValues>({
    resolver: zodResolver(FaceUploadSchema),
    defaultValues: {
      faceImage: '',
    }
  });

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const originalImageSrc = reader.result as string;

        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setPreview(originalImageSrc);
            fieldChange(originalImageSrc);
            toast({ title: "Image Processing Error", description: "Could not get canvas context. Using original image.", variant: "destructive" });
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

          // Optional: Apply sharpening - adjust kernel or remove if not desired for faces
          try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const sharpenedData = applySharpen(imageData, width, height);
            ctx.putImageData(sharpenedData, 0, 0);
          } catch (e) {
            console.error("Error during image sharpening for face:", e);
            // toast({ title: "Sharpening Opt.", description: "Proceeding with unsharpened version for face.", variant: "default" });
          }
          
          const processedDataUrl = canvas.toDataURL('image/jpeg', 0.85); 

          setPreview(processedDataUrl);
          fieldChange(processedDataUrl);
        };
        img.onerror = () => {
          setPreview(null);
          fieldChange('');
          toast({ title: "Image Load Error", description: "Could not load the selected image file.", variant: "destructive" });
        };
        img.src = originalImageSrc;
      };
      reader.onerror = () => {
          setPreview(null);
          fieldChange('');
          toast({ title: "File Read Error", description: "Could not read the selected file.", variant: "destructive" });
      }
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
          name="faceImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-headline text-base md:text-lg">Upload Your Face Image</FormLabel>
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
            <NextImage src={preview} alt="Face preview" width={200} height={200} className="rounded-md max-h-[300px] object-contain" data-ai-hint="person face" />
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isLoading || !preview} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-base md:text-lg py-3 md:py-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 ease-in-out"
        >
          {isLoading ? (
            <>
              <Smile className="mr-2 h-5 w-5 animate-pulse" />
              Analyzing Your Features...
            </>
          ) : (
            <>
              <Smile className="mr-2 h-5 w-5" />
              Reveal My Facial Insights
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
