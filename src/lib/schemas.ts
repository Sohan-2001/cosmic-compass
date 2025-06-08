
import { z } from 'zod';

export const AstrologyFormSchema = z.object({
  birthDate: z.date({ required_error: "Date of birth is required." }),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM."),
  birthLocation: z.string().min(3, "Birth location must be at least 3 characters."),
});

export type AstrologyFormValues = z.infer<typeof AstrologyFormSchema>;

export const PalmUploadSchema = z.object({
  palmImage: z.string().min(1, "Palm image is required."), // Expecting data URI
});

export type PalmUploadFormValues = z.infer<typeof PalmUploadSchema>;

// Schema for Lifetime Horoscope form
export const LifetimeHoroscopeFormSchema = z.object({
  birthDate: z.date({ required_error: "Date of birth is required." }),
  birthTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format. Use HH:MM."),
  birthLocation: z.string().min(3, "Birth location must be at least 3 characters."),
});

export type LifetimeHoroscopeFormValues = z.infer<typeof LifetimeHoroscopeFormSchema>;

// Schema for Face Reading form
export const FaceUploadSchema = z.object({
  faceImage: z.string().min(1, "Face image is required."), // Expecting data URI
});
export type FaceUploadFormValues = z.infer<typeof FaceUploadSchema>;
