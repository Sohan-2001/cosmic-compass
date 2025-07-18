'use client';

import { useState, type ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string) => void;
  onImageClear: () => void;
  disabled?: boolean;
}

export function ImageUploader({ onImageUpload, onImageClear, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) { // 4MB limit
        setError('File is too large. Please select an image under 4MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUri = reader.result as string;
      setPreview(dataUri);
      onImageUpload(dataUri);
      setError(null);
    };
    reader.onerror = () => {
        setError('Could not read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    onImageClear();
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = '';
    }
  }

  return (
    <div className="w-full">
      <div className={cn(
        "group relative flex justify-center items-center w-full h-64 rounded-lg border-2 border-dashed border-border transition-colors hover:border-accent",
        preview && 'border-solid'
      )}>
        {preview ? (
            <>
                <Image src={preview} alt="Image preview" layout="fill" objectFit="contain" className="rounded-lg p-2"/>
                <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10" onClick={handleClear} disabled={disabled}>
                    <X className="h-4 w-4" />
                </Button>
            </>
        ) : (
            <div className="text-center space-y-2 text-muted-foreground">
                <UploadCloud className="mx-auto h-12 w-12" />
                <Label htmlFor="file-upload">
                    <p>Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG, or WEBP (max 4MB)</p>
                </Label>
                <Input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/webp"
                    disabled={disabled}
                />
            </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
